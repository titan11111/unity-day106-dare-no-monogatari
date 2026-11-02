using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace DareNoMonogatari
{
    // 会話ウィンドウ・メニュー・HUD・効果音（IMGUI。アセット不要）
    public partial class DQGame
    {
        float shake; bool titleWait;
        string msgName = "", msgText = ""; float msgShown; bool msgActive;
        bool menuActive; string[] mOpts; string mTitle = ""; int mCur; float mx, my, mw; bool[] mDis;
        public int chosen;

        static int RndI(int n) { return n <= 0 ? 0 : UnityEngine.Random.Range(0, n); }

        static List<string> Pages(string text)
        {
            var lines = new List<string>();
            foreach (var seg in text.Split('\n'))
            {
                if (seg.Length == 0) { lines.Add(""); continue; }
                for (int i = 0; i < seg.Length; i += 24) lines.Add(seg.Substring(i, Math.Min(24, seg.Length - i)));
            }
            var pages = new List<string>();
            for (int i = 0; i < lines.Count; i += 3) pages.Add(string.Join("\n", lines.Skip(i).Take(3)));
            if (pages.Count == 0) pages.Add("");
            return pages;
        }

        IEnumerator Say(string text, string name = "")
        {
            foreach (var pg in Pages(text))
            {
                msgName = name ?? ""; msgText = pg; msgShown = 0; msgActive = true;
                while (true)
                {
                    yield return null;
                    msgShown += Time.deltaTime * 50f;
                    bool full = msgShown >= msgText.Length;
                    if (DQInput.OkE || DQInput.CancelE) { if (!full) msgShown = msgText.Length; else break; }
                }
            }
            msgActive = false;
        }

        IEnumerator Choose(string[] opts, string title, bool cancel, float x, float y, float w, bool[] dis = null)
        {
            mOpts = opts; mTitle = title ?? ""; mx = x; my = y; mw = w; mDis = dis; mCur = 0; menuActive = true;
            while (dis != null && mCur < dis.Length && dis[mCur] && mCur < opts.Length - 1) mCur++;
            int n = opts.Length;
            while (true)
            {
                yield return null;
                if (DQInput.UpE) { for (int k = 0; k < n; k++) { mCur = (mCur + n - 1) % n; if (!IsDis(mCur)) break; } }
                if (DQInput.DownE) { for (int k = 0; k < n; k++) { mCur = (mCur + 1) % n; if (!IsDis(mCur)) break; } }
                if (DQInput.OkE) { if (IsDis(mCur)) continue; chosen = mCur; break; }
                if (DQInput.CancelE && cancel) { chosen = -1; break; }
            }
            menuActive = false;
        }
        bool IsDis(int i) { return mDis != null && i < mDis.Length && mDis[i]; }

        // ---------------- 描画 ----------------
        GUIStyle st; float S; Vector2 off;
        void EnsureStyle()
        {
            if (st != null) return;
            var f = Resources.Load<Font>("Fonts/MPLUS1p-Regular");
            if (f == null) f = Font.CreateDynamicFontFromOSFont(new[] { "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "Noto Sans CJK JP", "Arial Unicode MS" }, 18);
            st = new GUIStyle(GUI.skin.label); st.font = f; st.wordWrap = false; st.richText = false; st.alignment = TextAnchor.UpperLeft;
        }
        Rect Rc(float x, float y, float w, float h) { return new Rect(off.x + x * S, off.y + y * S, w * S, h * S); }
        void Fill(Rect r, Color c) { var o = GUI.color; GUI.color = c; GUI.DrawTexture(r, Texture2D.whiteTexture); GUI.color = o; }
        void Box(float x, float y, float w, float h)
        {
            Fill(Rc(x - 3, y - 3, w + 6, h + 6), Color.white);
            Fill(Rc(x - 1, y - 1, w + 2, h + 2), new Color(.03f, .03f, .1f));
            Fill(Rc(x, y, w, h), new Color(.04f, .04f, .14f));
        }
        void Txt(float x, float y, string s, int size = 18, TextAnchor a = TextAnchor.UpperLeft, float w = 480, Color? c = null)
        {
            st.fontSize = Mathf.Max(8, Mathf.RoundToInt(size * S)); st.alignment = a;
            var col = c ?? Color.white;
            st.normal.textColor = new Color(0, 0, 0, .8f); GUI.Label(Rc(x + 1, y + 1, w, size * 1.7f), s, st);
            st.normal.textColor = col; GUI.Label(Rc(x, y, w, size * 1.7f), s, st);
        }

        void OnGUI()
        {
            if (D == null || Event.current.type != EventType.Repaint) return;
            EnsureStyle();
            S = Screen.height / 448f; off = new Vector2((Screen.width - 512 * S) / 2f, 0);
            if (shake > 0) off += new Vector2(UnityEngine.Random.Range(-4f, 4f), UnityEngine.Random.Range(-4f, 4f)) * S * Mathf.Min(1f, shake * 4f);
            if (mode == Mode.Title)
            {
                Fill(new Rect(0, 0, Screen.width, Screen.height), Color.black);
                Txt(0, 110, "だれの ものがたり？", 44, TextAnchor.UpperCenter, 512);
                Txt(0, 175, "～ ひとびと伝説 ～", 24, TextAnchor.UpperCenter, 512, new Color(1f, .85f, .3f));
                if (titleWait && ((int)(Time.time * 2) & 1) == 0) Txt(0, 320, "Zキー ／ Aボタン で スタート", 18, TextAnchor.UpperCenter, 512);
            }
            else if (mode == Mode.Card || mode == Mode.Select)
            {
                Fill(new Rect(0, 0, Screen.width, Screen.height), Color.black);
                if (!string.IsNullOrEmpty(cardText)) Txt(0, 190, cardText, 26, TextAnchor.UpperCenter, 512);
            }
            else if (mode == Mode.Map) DrawHud();
            else if (mode == Mode.Battle) DrawBattle();
            if (menuActive) DrawMenu();
            if (msgActive) DrawMsg();
            if (fadeA > 0.001f) Fill(new Rect(0, 0, Screen.width, Screen.height), new Color(0, 0, 0, fadeA));
        }

        void DrawHud()
        {
            if (pc == null) return;
            Box(8, 8, 150, 78);
            Txt(16, 10, pc.name, 16);
            Txt(16, 30, "LV " + pc.lv, 15); Txt(16, 48, "HP " + pc.hp + "/" + pc.mhp, 15); Txt(16, 66, "MP " + pc.mp + "/" + pc.mmp + "  " + gold + "G", 13);
            if (bannerT > 0 && !string.IsNullOrEmpty(banner)) { Box(156, 10, 200, 34); Txt(156, 14, banner, 18, TextAnchor.UpperCenter, 200); }
        }

        void DrawMsg()
        {
            Box(16, 322, 480, 110);
            if (!string.IsNullOrEmpty(msgName)) { Box(24, 294, Mathf.Max(90, msgName.Length * 18 + 24), 28); Txt(34, 297, msgName, 16); }
            int len = Mathf.Min(msgText.Length, (int)msgShown);
            var lines = msgText.Substring(0, len).Split('\n');
            for (int i = 0; i < lines.Length; i++) Txt(30, 332 + i * 30, lines[i], 18);
            if (msgShown >= msgText.Length && ((int)(Time.time * 2) & 1) == 0) Txt(466, 408, "▼", 16);
        }

        void DrawMenu()
        {
            float h = mOpts.Length * 28 + 16 + (mTitle.Length > 0 ? 28 : 0);
            float y = Mathf.Min(my, 440 - h), top = y + 8 + (mTitle.Length > 0 ? 28 : 0);
            Box(mx, y, mw, h);
            if (mTitle.Length > 0) Txt(mx + 12, y + 6, mTitle, 16, TextAnchor.UpperLeft, mw);
            for (int i = 0; i < mOpts.Length; i++)
            {
                Txt(mx + 30, top + i * 28, mOpts[i], 18, TextAnchor.UpperLeft, mw, IsDis(i) ? new Color(.5f, .5f, .5f) : Color.white);
                if (i == mCur) Txt(mx + 10, top + i * 28, "▶", 18);
            }
        }

        // ---------------- 効果音（コードで生成） ----------------
        AudioSource sfxSrc; Dictionary<string, AudioClip> sfxCache = new Dictionary<string, AudioClip>();
        static readonly Dictionary<string, float[]> SEQ = new Dictionary<string, float[]>
        {   // freq, dur, wave(0=square,1=sine,2=saw,3=tri) の3つ組
            {"hit", new float[]{220,.08f,0, 140,.1f,0}},
            {"heal", new float[]{523,.08f,1, 659,.08f,1, 784,.12f,1}},
            {"lvl", new float[]{523,.1f,0, 659,.1f,0, 784,.1f,0, 1046,.25f,0}},
            {"win", new float[]{392,.12f,0, 523,.12f,0, 659,.2f,0}},
            {"enc", new float[]{196,.07f,2, 147,.07f,2, 196,.07f,2, 147,.12f,2}},
            {"buy", new float[]{880,.05f,0, 1175,.08f,0}},
            {"crit", new float[]{880,.05f,2, 440,.15f,2}},
            {"open", new float[]{600,.07f,3, 900,.1f,3}},
            {"chest", new float[]{523,.07f,0, 784,.07f,0, 1046,.15f,0}},
            {"door", new float[]{120,.07f,2, 170,.09f,2, 240,.09f,2}},
        };
        void Sfx(string k)
        {
            if (sfxSrc == null || !SEQ.ContainsKey(k)) return;
            AudioClip c;
            if (!sfxCache.TryGetValue(k, out c))
            {
                const int SR = 22050; var q = SEQ[k]; var data = new List<float>();
                for (int i = 0; i < q.Length; i += 3)
                {
                    int n = (int)(q[i + 1] * SR); int w = (int)q[i + 2];
                    for (int s = 0; s < n; s++)
                    {
                        float ph = (s * q[i] / SR) % 1f, v;
                        v = w == 0 ? (ph < .5f ? 1f : -1f) : w == 1 ? Mathf.Sin(ph * 6.2832f) : w == 2 ? ph * 2f - 1f : Mathf.Abs(ph * 4f - 2f) - 1f;
                        data.Add(v * .12f * Mathf.Pow(1f - (float)s / n, 1.5f));
                    }
                }
                c = AudioClip.Create(k, data.Count, 1, SR, false); c.SetData(data.ToArray(), 0); sfxCache[k] = c;
            }
            sfxSrc.PlayOneShot(c);
        }
    }
}
