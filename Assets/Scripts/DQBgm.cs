using System;
using System.Collections.Generic;
using UnityEngine;

namespace DareNoMonogatari
{
    // ===== bgm: 外部音源なし。OnAudioFilterReadでその場で生成するジェネラティブBGM =====
    // JS版 dq/src/bgm.js の移植。構成: 3種シンセ(パッド/ベース/アルペジオ)+生成メロディ(シード付き)+合成ドラム
    // リバーブ/ディレイはUnity標準のAudioReverbFilter/AudioEchoFilterで代用(自前畳み込みは省略)。
    [RequireComponent(typeof(AudioSource))]
    public class DQBgm : MonoBehaviour
    {
        public static DQBgm I;

        class Theme
        {
            public string name; public float bpm; public int key; public int[] scale;
            public (int root, string chord)[] prog;
            public float pad, padCut; public string bass, arp; public float arpVol, lead;
            public int[] rhy; public int[] mphr; public float rev, dly, sparse;
            public int waveType; // lead
            public string kick, snare, hat; public float sw;
        }

        static readonly Dictionary<string, int[]> CT = new Dictionary<string, int[]> {
            {"M", new[]{0,4,7}}, {"m", new[]{0,3,7}}, {"M7", new[]{0,4,7,11}}, {"m7", new[]{0,3,7,10}},
            {"sus", new[]{0,5,7}}, {"add9", new[]{0,4,7,14}}, {"m9", new[]{0,3,7,14}},
        };
        static readonly Dictionary<string, int[]> MODE = new Dictionary<string, int[]> {
            {"min", new[]{0,2,3,5,7,8,10}}, {"maj", new[]{0,2,4,5,7,9,11}}, {"dor", new[]{0,2,3,5,7,9,10}},
            {"phr", new[]{0,1,3,5,7,8,10}}, {"lyd", new[]{0,2,4,6,7,9,11}},
        };
        static readonly (int st, int len)[][] RHY = {
            new (int, int)[]{(0,4),(4,2),(6,2),(8,4),(12,4)},
            new (int, int)[]{(0,2),(2,2),(4,4),(8,2),(10,2),(12,4)},
            new (int, int)[]{(0,6),(6,2),(8,4),(12,2),(14,2)},
            new (int, int)[]{(2,2),(4,2),(8,6),(14,2)},
            new (int, int)[]{(0,8),(8,8)},
            new (int, int)[]{(0,3),(3,3),(6,2),(8,3),(11,3),(14,2)},
            new (int, int)[]{(0,2),(2,2),(4,2),(6,2),(8,2),(10,2),(12,2),(14,2)},
        };
        const int SINE = 0, SQUARE = 1, SAW = 2, TRI = 3;

        static Dictionary<string, Theme> THEMES;
        static void BuildThemes()
        {
            THEMES = new Dictionary<string, Theme>();
            void Add(string name, float bpm, int key, string mode, (int, string)[] prog, float pad, float padCut,
                string bass, string arp, float arpVol, float lead, int[] rhy, int[] mphr, float rev, float dly,
                int waveType, string kick = null, string snare = null, string hat = null, float sw = 0, float sparse = 0)
            {
                THEMES[name] = new Theme {
                    name = name, bpm = bpm, key = key, scale = MODE[mode], prog = prog, pad = pad, padCut = padCut,
                    bass = bass, arp = arp, arpVol = arpVol, lead = lead, rhy = rhy, mphr = mphr, rev = rev, dly = dly,
                    waveType = waveType, kick = kick, snare = snare, hat = hat, sw = sw, sparse = sparse
                };
            }
            Add("title", 70, 9, "min", new[] { (45, "m9"), (41, "M7"), (48, "M"), (43, "sus") }, .11f, 900,
                "x.......o.......", "0.1.2.1.0.1.2.3.", .07f, .07f, new[] { 4, 0, 3 }, new[] { 0, 1, 0, 2 }, .9f, .45f, TRI);
            Add("select", 84, 7, "maj", new[] { (43, "M"), (40, "m"), (36, "M7"), (38, "sus") }, .09f, 1200,
                "x...x...x...x...", "0.1.2.1.", .06f, .08f, new[] { 0, 1 }, new[] { 0, 0, 1, 0 }, .7f, .3f, TRI);
            Add("village", 104, 0, "maj", new[] { (48, "M"), (43, "M"), (45, "m"), (41, "M7") }, .06f, 1500,
                "x.....x.x.....o.", "0.12.1.20.12.1.2", .075f, .1f, new[] { 1, 0, 5 }, new[] { 0, 1, 0, 2 }, .5f, .28f, TRI, sw: .1f);
            Add("world", 116, 2, "dor", new[] { (38, "m7"), (45, "M"), (46, "M7"), (41, "M") }, .07f, 1800,
                "x..x..x.x..x.o..", "0.1.2.1.0.1.2.1.", .06f, .1f, new[] { 0, 1, 2, 6 }, new[] { 0, 1, 0, 2 }, .6f, .34f, SAW,
                kick: "x.......x.......", hat: "..x...x...x...x.");
            Add("cave", 58, 4, "phr", new[] { (40, "m"), (41, "M"), (40, "m"), (47, "sus") }, .1f, 500,
                "x...............", "", 0, .07f, new[] { 4, 3 }, new[] { 0, 1, 2, 1 }, 1f, .55f, SINE, sparse: .55f);
            Add("shrine", 66, 5, "lyd", new[] { (41, "M7"), (43, "M"), (45, "m7"), (43, "add9") }, .1f, 1400,
                "x...............", "0...2...1...3...", .06f, .08f, new[] { 4, 3, 0 }, new[] { 0, 1, 0, 2 }, 1f, .5f, SINE);
            Add("castle", 86, 0, "min", new[] { (36, "m"), (44, "M"), (46, "M"), (43, "M") }, .09f, 700,
                "x.x.x.x.x.x.x.o.", "0.2.1.2.0.2.1.3.", .05f, .09f, new[] { 3, 0, 5 }, new[] { 0, 1, 0, 2 }, .8f, .4f, SAW,
                kick: "x.......x..x....", hat: "");
            Add("battle", 158, 4, "min", new[] { (40, "m"), (36, "M"), (43, "M"), (38, "M") }, .05f, 1800,
                "xxoxxoxxxxoxxoxx", "0.1.2.1.0.1.2.1.", .05f, .1f, new[] { 6, 0, 1, 5 }, new[] { 0, 1, 0, 2 }, .35f, .2f, SAW,
                kick: "x...x...x...x...", snare: "....x.......x...", hat: "x.x.x.x.x.x.x.xx");
            Add("boss", 166, 2, "min", new[] { (38, "m"), (34, "M"), (36, "M"), (33, "M") }, .06f, 2200,
                "xxxxoxxxxxxxoxxx", "0121232101212321", .06f, .11f, new[] { 6, 5, 0, 1 }, new[] { 0, 1, 0, 2 }, .35f, .25f, SAW,
                kick: "x..xx..xx..xx..x", snare: "....x.......x..x", hat: "xxxxxxxxxxxxxxxx");
            Add("ending", 76, 0, "maj", new[] { (48, "M"), (45, "m"), (41, "M7"), (43, "sus") }, .12f, 1600,
                "x.......x.......", "0.1.2.3.2.1.0.1.", .07f, .1f, new[] { 4, 0, 1 }, new[] { 0, 1, 2, 3 }, .9f, .4f, TRI);
        }

        static float Mtof(int n) => 440f * Mathf.Pow(2f, (n - 69) / 12f);

        // xorshift32 (JS版 prng と同一アルゴリズム)
        struct Prng
        {
            uint s;
            public Prng(long seed) { s = (uint)(seed & 0xFFFFFFFFL); if (s == 0) s = 1; }
            public float Next() { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return s / 4294967296f; }
        }

        // ---- ボイス(発音)プール。audio thread からのみ触る ----
        const int MaxVoices = 48;
        struct Voice
        {
            public bool active; public int wave; public int detCount;
            public float f; public float det0, det1, det2;
            public float ph0, ph1, ph2;
            public float svfLow, svfBand; public float cut, cutEnd; public bool hasCutEnd; public float q;
            public double startSample, holdEndSample, killSample; public float attackSamples, releaseTC;
            public float vol, gain, pan;
        }
        Voice[] voices = new Voice[MaxVoices];

        struct Drum
        {
            public bool active; public int kind; // 0 kick,1 snare,2 hat
            public double startSample, killSample; public float vol;
            public float kickPhase; public float snareTonePhase; public float noiseLast;
        }
        const int MaxDrums = 12;
        Drum[] drums = new Drum[MaxDrums];

        double samplePos;
        int sampleRate;
        System.Random rng = new System.Random();

        Theme curTheme, wantTheme;
        double nextStepSample; int stepIndex;
        double fadeStartSample; double fadeDurSamples;
        const int MelCap = 16;
        int[] melSt = new int[MelCap]; int[] melN = new int[MelCap]; int[] melLen = new int[MelCap]; int melCount;

        public bool Muted = false;
        float masterGain = .55f;

        AudioReverbFilter reverb; AudioEchoFilter echo;

        void Awake()
        {
            I = this;
            BuildThemes();
            sampleRate = AudioSettings.outputSampleRate;
            reverb = gameObject.AddComponent<AudioReverbFilter>();
            reverb.reverbPreset = AudioReverbPreset.Off;
            reverb.dryLevel = 0; reverb.room = -1000; reverb.reverbLevel = -1000;
            echo = gameObject.AddComponent<AudioEchoFilter>();
            echo.delay = 375; echo.decayRatio = .34f; echo.wetMix = 0f; echo.dryMix = 1f;
            var src = GetComponent<AudioSource>();
            src.clip = null; src.loop = true; src.spatialBlend = 0; src.volume = 1;
            src.Play();
        }

        public void SetWantedTheme(string name)
        {
            if (string.IsNullOrEmpty(name)) return;
            if (THEMES.TryGetValue(name, out var t)) wantTheme = t;
            if (wantTheme != null && curTheme != wantTheme)
            {
                curTheme = wantTheme;
                double now = samplePos;
                nextStepSample = now + .06 * sampleRate;
                stepIndex = 0; melCount = 0;
                fadeStartSample = now; fadeDurSamples = 1.0 * sampleRate;
                // リバーブ/ディレイのウェット量をテーマに合わせて更新(メインスレッドでのみプロパティ書き込み)
                reverb.reverbPreset = AudioReverbPreset.User;
                reverb.room = Mathf.Lerp(-2000, -400, curTheme.rev);
                reverb.reverbLevel = Mathf.Lerp(-1000, 0, curTheme.rev);
                reverb.decayTime = Mathf.Lerp(1.2f, 4.5f, curTheme.rev);
                reverb.dryLevel = 0;
                echo.wetMix = curTheme.dly * .5f;
                echo.delay = 60000f / curTheme.bpm; // 1拍ぶん(ms)
            }
        }

        void Update()
        {
            if (Input.GetKeyDown(KeyCode.M)) Muted = !Muted;
        }

        // ================= オーディオスレッド =================
        void OnAudioFilterRead(float[] data, int channels)
        {
            int frames = data.Length / channels;
            float mg = Muted ? 0f : masterGain;
            for (int i = 0; i < frames; i++)
            {
                if (curTheme != null && samplePos >= nextStepSample)
                {
                    StepTrigger();
                    double d16 = (60.0 / curTheme.bpm / 4.0) * sampleRate;
                    nextStepSample += d16;
                    stepIndex++;
                }
                float fg = 1f;
                if (fadeDurSamples > 0)
                {
                    double el = samplePos - fadeStartSample;
                    fg = (float)Mathf.Clamp01((float)(el / fadeDurSamples));
                }
                float mix = RenderVoices() * fg + RenderDrums();
                mix = SoftClip(mix * mg);
                int baseIdx = i * channels;
                for (int c = 0; c < channels; c++) data[baseIdx + c] = mix;
                samplePos += 1;
            }
        }

        static float SoftClip(float x) => Mathf.Clamp(x, -1f, 1f);

        float RenderVoices()
        {
            float sum = 0;
            for (int vi = 0; vi < MaxVoices; vi++)
            {
                ref var v = ref voices[vi];
                if (!v.active) continue;
                if (samplePos >= v.killSample) { v.active = false; continue; }
                // envelope
                double elapsedA = samplePos - v.startSample;
                float target;
                if (elapsedA < v.attackSamples)
                {
                    v.gain = v.vol * (float)(elapsedA / Math.Max(1f, v.attackSamples));
                }
                else if (samplePos < v.holdEndSample)
                {
                    v.gain = v.vol;
                }
                else
                {
                    target = 0.0001f;
                    float coef = 1f - Mathf.Exp(-1f / (sampleRate * Mathf.Max(0.001f, v.releaseTC)));
                    v.gain += (target - v.gain) * coef;
                }
                // oscillators
                float osc = Osc(v.wave, v.ph0);
                v.ph0 += FreqOf(v.f, v.det0) / sampleRate; if (v.ph0 >= 1f) v.ph0 -= 1f;
                float sOut = osc;
                if (v.detCount > 1)
                {
                    sOut += Osc(v.wave, v.ph1);
                    v.ph1 += FreqOf(v.f, v.det1) / sampleRate; if (v.ph1 >= 1f) v.ph1 -= 1f;
                }
                if (v.detCount > 2)
                {
                    sOut += Osc(v.wave, v.ph2);
                    v.ph2 += FreqOf(v.f, v.det2) / sampleRate; if (v.ph2 >= 1f) v.ph2 -= 1f;
                }
                sOut /= v.detCount;
                // state-variable lowpass
                float cutoff = v.cut;
                if (v.hasCutEnd)
                {
                    float frac = (float)Mathf.Clamp01((float)(elapsedA / Math.Max(1.0, v.holdEndSample - v.startSample)));
                    cutoff = Mathf.Lerp(v.cut, v.cutEnd, frac);
                }
                float fcoef = 2f * Mathf.Sin(Mathf.PI * Mathf.Clamp(cutoff, 20f, sampleRate * .45f) / sampleRate);
                float qInv = 1f / Mathf.Max(.3f, v.q);
                v.svfLow += fcoef * v.svfBand;
                float high = sOut - v.svfLow - qInv * v.svfBand;
                v.svfBand += fcoef * high;
                sum += v.svfLow * v.gain;
            }
            return sum;
        }

        static float FreqOf(float f, float cents) => f * Mathf.Pow(2f, cents / 1200f);
        static float Osc(int wave, float p)
        {
            switch (wave)
            {
                case SQUARE: return p < .5f ? 1f : -1f;
                case SAW: return 2f * p - 1f;
                case TRI: return p < .5f ? 4f * p - 1f : 3f - 4f * p;
                default: return Mathf.Sin(p * 2f * Mathf.PI);
            }
        }

        float RenderDrums()
        {
            float sum = 0;
            for (int i = 0; i < MaxDrums; i++)
            {
                ref var d = ref drums[i];
                if (!d.active) continue;
                if (samplePos >= d.killSample) { d.active = false; continue; }
                double el = (samplePos - d.startSample) / sampleRate;
                if (d.kind == 0)
                {
                    float freq = Mathf.Lerp(160f, 42f, Mathf.Clamp01((float)(el / .13)));
                    d.kickPhase += freq / sampleRate; if (d.kickPhase >= 1f) d.kickPhase -= 1f;
                    float amp = d.vol * .55f * Mathf.Exp(-(float)el / .08f);
                    sum += Osc(SINE, d.kickPhase) * amp;
                }
                else if (d.kind == 1)
                {
                    float noise = (float)(rng.NextDouble() * 2 - 1);
                    float amp = d.vol * .3f * Mathf.Exp(-(float)el / .05f);
                    float tfreq = Mathf.Lerp(220f, 130f, Mathf.Clamp01((float)(el / .09)));
                    d.snareTonePhase += tfreq / sampleRate; if (d.snareTonePhase >= 1f) d.snareTonePhase -= 1f;
                    float tone = Osc(TRI, d.snareTonePhase) * d.vol * .18f * Mathf.Exp(-(float)el / .035f);
                    sum += noise * amp + tone;
                }
                else
                {
                    float noise = (float)(rng.NextDouble() * 2 - 1);
                    float hp = noise - d.noiseLast; d.noiseLast = noise;
                    float amp = d.vol * .14f * Mathf.Exp(-(float)el / .018f);
                    sum += hp * amp;
                }
            }
            return sum;
        }

        void TriggerVoice(float f, double durSamples, int wave, float vol, float attackSec, float releaseSec,
            float cut, float cutEnd, bool hasCutEnd, float q, float pan, float det0, float det1, float det2, int detCount)
        {
            for (int i = 0; i < MaxVoices; i++)
            {
                if (voices[i].active) continue;
                voices[i] = new Voice {
                    active = true, wave = wave, detCount = Mathf.Max(1, detCount), f = f,
                    det0 = det0, det1 = det1, det2 = det2,
                    ph0 = (float)rng.NextDouble(), ph1 = (float)rng.NextDouble(), ph2 = (float)rng.NextDouble(),
                    cut = cut, cutEnd = cutEnd, hasCutEnd = hasCutEnd, q = q,
                    startSample = samplePos, holdEndSample = samplePos + durSamples,
                    killSample = samplePos + durSamples + releaseSec * 2.2 * sampleRate + sampleRate * .2,
                    attackSamples = attackSec * sampleRate, releaseTC = Mathf.Max(.02f, releaseSec / 3f),
                    vol = vol, gain = 0, pan = pan
                };
                return;
            }
        }

        void TriggerDrum(int kind, float vol)
        {
            for (int i = 0; i < MaxDrums; i++)
            {
                if (drums[i].active) continue;
                drums[i] = new Drum { active = true, kind = kind, startSample = samplePos, vol = vol,
                    killSample = samplePos + sampleRate * .3, kickPhase = 0, snareTonePhase = 0, noiseLast = 0 };
                return;
            }
        }

        // ================= シーケンサ(オーディオスレッドから1/16音符ごとに呼ばれる) =================
        void StepTrigger()
        {
            var T = curTheme;
            double d16 = 60.0 / T.bpm / 4.0 * sampleRate;
            int bar = stepIndex / 16, k = stepIndex % 16;
            var ch = T.prog[bar % T.prog.Length];
            var tones = CT[ch.chord];

            if (k == 0)
            {
                int cnt = Mathf.Min(4, tones.Length);
                for (int ti = 0; ti < cnt; ti++)
                {
                    float f = Mtof(ch.root + 12 + tones[ti]);
                    TriggerVoice(f, d16 * 16, SAW, T.pad / cnt * 1.6f, .5f, .9f,
                        T.padCut * .6f, T.padCut, true, .8f, 0, -9, 0, 9, 3);
                }
                ComputeMelody(T, bar, ch, tones);
            }

            char bp = k < T.bass.Length ? T.bass[k] : '.';
            if (bp != '.')
            {
                int n = ch.root + (bp == 'o' ? 12 : bp == '5' ? 7 : 0);
                TriggerVoice(Mtof(n), d16 * 1.6, SQUARE, .11f, .005f, .1f, 420, 260, true, 1.4f, 0, 0, 0, 0, 1);
                TriggerVoice(Mtof(n - 12), d16 * 1.8, SINE, .16f, .01f, .12f, 300, 0, false, .8f, 0, 0, 0, 0, 1);
            }
            if (T.arp.Length > 0 && T.arpVol > 0)
            {
                char a = T.arp[k % T.arp.Length];
                if (a != '.' && a != '\0')
                {
                    int idx = a - '0';
                    int n = ch.root + 24 + tones[idx % tones.Length] + (idx >= tones.Length ? 12 : 0);
                    float jt = ((float)rng.NextDouble() - .5f) * .008f * sampleRate;
                    TriggerVoiceDelayed(jt, Mtof(n), d16 * 1.1, TRI, T.arpVol, .003f, .12f, 3200, 900, true, .8f, idx % 2 != 0 ? .35f : -.35f);
                }
            }
            if (T.lead > 0)
            {
                for (int mi = 0; mi < melCount; mi++)
                {
                    if (melSt[mi] != k) continue;
                    float sw = T.sw > 0 ? (float)(d16 * T.sw) : 0;
                    float jt = ((float)rng.NextDouble() - .5f) * .008f * sampleRate;
                    float volr = T.lead * (.85f + (float)rng.NextDouble() * .3f);
                    if (T.waveType == SAW)
                        TriggerVoiceDelayed(sw + jt, Mtof(melN[mi]), d16 * melLen[mi] * .92, SAW, volr, .012f, .18f, 2600, 1400, true, .8f, .15f, -7, 7, 2);
                    else
                        TriggerVoiceDelayed(sw + jt, Mtof(melN[mi]), d16 * melLen[mi] * .92, T.waveType, volr, .02f, .18f, 4200, 1400, true, .8f, .15f, 0, 4, 2);
                }
            }
            if (T.kick != null && k < T.kick.Length && T.kick[k] == 'x') TriggerDrum(0, k == 0 ? 1f : .85f);
            if (T.snare != null && k < T.snare.Length && T.snare[k] == 'x') TriggerDrum(1, 1f);
            if (T.hat != null && k < T.hat.Length && T.hat[k] == 'x') TriggerDrum(2, k % 4 == 2 ? 1f : .6f);
        }

        // パン無しの単純版 TriggerVoice オーバーロード(detune省略)
        void TriggerVoice(float f, double durSamples, int wave, float vol, float attackSec, float releaseSec,
            float cut, float cutEnd, bool hasCutEnd, float q, float pan)
            => TriggerVoice(f, durSamples, wave, vol, attackSec, releaseSec, cut, cutEnd, hasCutEnd, q, pan, 0, 0, 0, 1);

        // サンプル単位のわずかな発音遅延(ジッター・スイング用)。即時トリガーと同じだが開始サンプルを微調整。
        void TriggerVoiceDelayed(float delaySamples, float f, double durSamples, int wave, float vol, float attackSec, float releaseSec,
            float cut, float cutEnd, bool hasCutEnd, float q, float pan, float det0 = 0, float det1 = 0, int detCount = 1)
        {
            double saved = samplePos; samplePos += delaySamples;
            TriggerVoice(f, durSamples, wave, vol, attackSec, releaseSec, cut, cutEnd, hasCutEnd, q, pan, det0, det1, 0, detCount);
            samplePos = saved;
        }

        void ComputeMelody(Theme T, int bar, (int root, string chord) ch, int[] tones)
        {
            melCount = 0;
            var pcsSet = new bool[12];
            foreach (var iv in tones) pcsSet[((ch.root + iv) % 12 + 12) % 12] = true;
            var scSet = new bool[12];
            foreach (var iv in T.scale) scSet[((T.key + iv) % 12 + 12) % 12] = true;
            Span<int> poolBuf = stackalloc int[30]; int poolCount = 0;
            for (int n = 62; n <= 91; n++) if (scSet[((n % 12) + 12) % 12]) poolBuf[poolCount++] = n;
            int ph = T.mphr[bar % T.mphr.Length];
            long seed = (long)(T.bpm * 131) + T.key * 977 + ph * 7919 + (ph != 0 ? bar % 2 : 0);
            var r = new Prng(seed);
            int rhyPick = Mathf.Clamp(Mathf.FloorToInt(r.Next() * T.rhy.Length), 0, T.rhy.Length - 1);
            var tmpl = RHY[T.rhy[rhyPick]];
            int idx = -1;
            for (int k = 0; k < poolCount; k++) if (pcsSet[((poolBuf[k] % 12) + 12) % 12] && poolBuf[k] >= 72) { idx = k; break; }
            if (idx < 0) idx = poolCount / 2;
            idx += Mathf.FloorToInt(r.Next() * 4) - 1; idx = Mathf.Clamp(idx, 0, poolCount - 1);
            for (int i = 0; i < tmpl.Length; i++)
            {
                var (st, len) = tmpl[i];
                if (T.sparse > 0 && r.Next() < T.sparse) continue;
                if (st % 4 == 0 && i > 0)
                {
                    int best = idx; float bd = 99;
                    for (int k = 0; k < poolCount; k++)
                        if (pcsSet[((poolBuf[k] % 12) + 12) % 12])
                        { float d = Mathf.Abs(k - idx) + r.Next() * 1.5f; if (d < bd) { bd = d; best = k; } }
                    idx = best;
                }
                else if (i > 0)
                {
                    idx += (r.Next() < .5f ? -1 : 1) * (r.Next() < .7f ? 1 : 2);
                }
                if (bar % 4 == 3 && i == tmpl.Length - 1)
                {
                    for (int k = 0; k < poolCount; k++)
                        if (((poolBuf[k] % 12) + 12) % 12 == ((ch.root % 12) + 12) % 12 && poolBuf[k] >= 70) { idx = k; break; }
                }
                idx = Mathf.Clamp(idx, 0, poolCount - 1);
                if (melCount < MelCap) { melSt[melCount] = st; melN[melCount] = poolBuf[idx]; melLen[melCount] = len; melCount++; }
            }
        }
    }
}
