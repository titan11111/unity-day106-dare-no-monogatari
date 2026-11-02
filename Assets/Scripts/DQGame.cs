using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace DareNoMonogatari
{
    public enum Mode { Title, Card, Map, Battle, Select }

    public class NpcRt
    {
        public NpcDef d; public int x, y, hx, hy, dir; public GameObject go; public SpriteRenderer sr;
        public bool moving; public float t; public int fx, fy; public float wait;
    }

    // 一つのシーンで全部動く本体。シーンに何も置かなくても起動時に自動生成される。
    public partial class DQGame : MonoBehaviour
    {
        public const string WALK = ".,=fdezcGEhxBFVAYZ", WOK = ".,=xfzc";
        static readonly int[] FX = { 0, 0, -1, 1 }, FY = { 1, -1, 0, 0 }, OPP = { 1, 0, 3, 2 };

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Boot()
        {
            if (FindFirstObjectByType<DQGame>() != null) return;
            var go = new GameObject("DQGame");
            go.AddComponent<DQGame>();
            go.AddComponent<DQBgm>();
        }

        GameData D;
        Dictionary<string, MapDef> maps = new Dictionary<string, MapDef>();
        Dictionary<string, MonDef> mons = new Dictionary<string, MonDef>();
        Dictionary<string, CharDef> chars = new Dictionary<string, CharDef>();
        Dictionary<string, StoryDef> stories = new Dictionary<string, StoryDef>();

        // ---- 状態 ----
        Mode mode = Mode.Title;
        Pc pc; string story = ""; HashSet<string> flags = new HashSet<string>(); int gold; string home = "v1";
        MapDef map; char[][] grid; int px, py, dir, steps; bool busy;
        string cardText = ""; string banner = ""; float bannerT; float fadeA = 1f;
        bool creditsDone;

        // ---- 表示 ----
        Camera cam; Transform mapRoot; SpriteRenderer[,] tiles; GameObject playerGo; SpriteRenderer playerSr;
        List<NpcRt> npcs = new List<NpcRt>();
        bool moving; float moveT; int fromX, fromY, toX, toY; float animT;
        Dictionary<string, Sprite> sprCache = new Dictionary<string, Sprite>();
        Dictionary<string, Texture2D> texCache = new Dictionary<string, Texture2D>();

        void Awake()
        {
            var ta = Resources.Load<TextAsset>("Data/gamedata");
            if (ta == null) { Debug.LogError("Resources/Data/gamedata.json が見つかりません"); enabled = false; return; }
            D = JsonUtility.FromJson<GameData>(ta.text);
            foreach (var m in D.maps) maps[m.id] = m;
            foreach (var m in D.mons) mons[m.key] = m;
            foreach (var c in D.chars) chars[c.id] = c;
            foreach (var s in D.stories) stories[s.id] = s;
            SetupCamera();
            var pg = new GameObject("Player"); pg.transform.SetParent(transform);
            playerSr = pg.AddComponent<SpriteRenderer>(); playerGo = pg; pg.SetActive(false);
            if (FindFirstObjectByType<AudioListener>() == null) gameObject.AddComponent<AudioListener>();
            sfxSrc = gameObject.AddComponent<AudioSource>();
        }

        void Start() { StartCoroutine(TitleFlow()); }

        void SetupCamera()
        {
            cam = Camera.main;
            if (cam == null) { var g = new GameObject("DQCamera"); g.tag = "MainCamera"; cam = g.AddComponent<Camera>(); }
            cam.orthographic = true; cam.orthographicSize = 7f; cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = Color.black; cam.transform.position = new Vector3(0, 0, -10); cam.transform.rotation = Quaternion.identity;
        }

        // ---------------- スプライト ----------------
        Texture2D Tex(string path)
        {
            Texture2D t;
            if (texCache.TryGetValue(path, out t)) return t;
            t = Resources.Load<Texture2D>(path); if (t != null) t.filterMode = FilterMode.Point;
            texCache[path] = t; return t;
        }
        Sprite TileSprite(char ch, string floor, string kind, int v)
        {
            string name = "Tiles/t_" + (int)ch + "_" + (int)floor[0] + "_" + kind + "_" + v;
            Sprite s;
            if (sprCache.TryGetValue(name, out s)) return s;
            var t = Tex(name);
            if (t == null) { if (v != 0) return TileSprite(ch, floor, kind, 0); sprCache[name] = null; return null; }
            s = Sprite.Create(t, new Rect(0, 0, t.width, t.height), new Vector2(.5f, .5f), t.width);
            sprCache[name] = s; return s;
        }
        Sprite CharSprite(string key, int d, int st)
        {
            string name = "Chars/" + key + "_" + d + "_" + st; Sprite s;
            if (sprCache.TryGetValue(name, out s)) return s;
            var t = Tex("Chars/" + key); if (t == null) { sprCache[name] = null; return null; }
            s = Sprite.Create(t, new Rect(st * 96, t.height - (d + 1) * 96, 96, 96), new Vector2(.5f, .5f), 96);
            sprCache[name] = s; return s;
        }
        Sprite MonSprite(string key)
        {
            string name = "Monsters/" + key; Sprite s;
            if (sprCache.TryGetValue(name, out s)) return s;
            var t = Tex(name); if (t == null) { sprCache[name] = null; return null; }
            s = Sprite.Create(t, new Rect(0, 0, t.width, t.height), new Vector2(.5f, 38f / 300f), 64);
            sprCache[name] = s; return s;
        }

        // ---------------- マップ構築 ----------------
        string Kind() { return (map.kind == "village" || map.kind == "world") ? "out" : "in"; }

        void BuildMap()
        {
            if (mapRoot != null) Destroy(mapRoot.gameObject);
            foreach (var n in npcs) if (n.go != null) Destroy(n.go);
            npcs.Clear();
            mapRoot = new GameObject("Map").transform; mapRoot.SetParent(transform);
            grid = new char[map.h][];
            for (int y = 0; y < map.h; y++) grid[y] = map.rows[y].ToCharArray();
            tiles = new SpriteRenderer[map.w, map.h];
            for (int y = 0; y < map.h; y++)
                for (int x = 0; x < map.w; x++)
                {
                    var g = new GameObject("t"); g.transform.SetParent(mapRoot);
                    g.transform.position = new Vector3(x, -y, 0);
                    var sr = g.AddComponent<SpriteRenderer>(); sr.sortingOrder = 0; tiles[x, y] = sr;
                }
            if (map.id == "world")
            {
                var ct = Tex("Tiles/castle");
                if (ct != null)
                {
                    var g = new GameObject("castle"); g.transform.SetParent(mapRoot); g.transform.position = new Vector3(23, -26, 0);
                    var sr = g.AddComponent<SpriteRenderer>(); sr.sortingOrder = 1;
                    sr.sprite = Sprite.Create(ct, new Rect(0, 0, ct.width, ct.height), new Vector2(.5f, .5f), ct.width / 5f);
                }
            }
            RefreshMap();
            for (int y = 0; y < map.h; y++) for (int x = 0; x < map.w; x++) SetTile(x, y);
            // NPC
            if (stories.ContainsKey(story))
                foreach (var d in stories[story].npcs)
                {
                    if (d.map != map.id) continue;
                    var n = new NpcRt { d = d, x = d.x, y = d.y, hx = d.x, hy = d.y, dir = d.dir, wait = UnityEngine.Random.Range(1f, 4f) };
                    n.go = new GameObject("npc_" + d.id); n.go.transform.SetParent(mapRoot);
                    n.sr = n.go.AddComponent<SpriteRenderer>();
                    if (!string.IsNullOrEmpty(d.mon))
                    {
                        n.sr.sprite = MonSprite(d.mon);
                        float sz = mons.ContainsKey(d.mon) && mons[d.mon].sz > 0 ? mons[d.mon].sz : 1f;
                        n.go.transform.localScale = Vector3.one * (d.mk / sz);
                    }
                    npcs.Add(n); PlaceNpc(n);
                }
            RefreshNpcs();
            playerGo.SetActive(true);
            playerGo.transform.position = new Vector3(px, -py, 0);
            UpdatePlayerSprite(0);
        }

        void SetTile(int x, int y)
        {
            int v = (x * 7 + y * 13) % 5;
            tiles[x, y].sprite = TileSprite(grid[y][x], map.floor, Kind(), v);
        }

        void RefreshMap()
        {
            for (int y = 0; y < map.h; y++)
                for (int x = 0; x < map.w; x++)
                    if (map.rows[y][x] == 'D') { grid[y][x] = flags.Contains("door:" + map.id + ":" + x + "," + y) ? 'd' : 'D'; if (tiles != null) SetTile(x, y); }
            foreach (var c in map.chests) { grid[c.y][c.x] = flags.Contains(c.id) ? 'O' : 'X'; if (tiles != null) SetTile(c.x, c.y); }
            foreach (var d in map.dyn) { grid[d.y][d.x] = (flags.Contains(d.fl) ? d.on : d.off)[0]; if (tiles != null) SetTile(d.x, d.y); }
        }

        int ShowMask(NpcDef d) { int m = 0; for (int i = 0; i < d.sf.Length; i++) if (flags.Contains(d.sf[i])) m |= 1 << i; return m; }
        bool NpcVisible(NpcRt n) { int m = ShowMask(n.d); return n.d.st != null && m < n.d.st.Length ? n.d.st[m] : true; }
        void RefreshNpcs() { foreach (var n in npcs) n.go.SetActive(NpcVisible(n)); }
        void PlaceNpc(NpcRt n)
        {
            float x = n.x, y = -n.y;
            if (n.moving) { float p = Mathf.Clamp01(n.t); x = Mathf.Lerp(n.fx, n.x, p); y = -Mathf.Lerp(n.fy, n.y, p); }
            if (!string.IsNullOrEmpty(n.d.mon)) { n.go.transform.position = new Vector3(x, y - .5f + 2f / 32f, 0); n.sr.sortingOrder = 100 + (int)(-y * 10) ; }
            else
            {
                n.go.transform.position = new Vector3(x, y, 0);
                int st = n.moving ? 1 + (((int)(Time.time * 8)) & 1) : 0;
                n.sr.sprite = CharSprite(n.d.spr, n.dir, st); n.sr.sortingOrder = 100 + (int)(-y * 10);
            }
        }
        NpcRt NpcAt(int x, int y)
        {
            foreach (var n in npcs) if (n.go.activeSelf && ((n.x == x && n.y == y) || (n.moving && n.fx == x && n.fy == y))) return n;
            return null;
        }
        bool CanWalk(int x, int y)
        {
            if (x < 0 || y < 0 || x >= map.w || y >= map.h) return false;
            if (WALK.IndexOf(grid[y][x]) < 0) return false;
            return NpcAt(x, y) == null;
        }
        void UpdatePlayerSprite(int st)
        {
            playerSr.sprite = CharSprite(chars[story].spr, dir, st);
            float y = -py; if (moving) y = Mathf.Lerp(-fromY, -toY, moveT);
            playerSr.sortingOrder = 100 + (int)(-y * 10);
        }

        // ---------------- 毎フレーム ----------------
        void Update()
        {
            DQInput.Poll();
            if (bannerT > 0) bannerT -= Time.deltaTime;
            if (shake > 0) shake -= Time.deltaTime;
            if (mode == Mode.Map)
            {
                if (!busy) MapUpdate();
                UpdateNpcs();
                UpdateCamera();
                if (map != null && map.kind == "world")
                {
                    var wn = WorldName(px, py);
                    if (wn != wname) { wname = wn; banner = wn; bannerT = 2.2f; }
                }
            }
            else if (mode == Mode.Battle) { }
            var bgmName = BgmThemeName();
            if (bgmName != null && DQBgm.I != null) DQBgm.I.SetWantedTheme(bgmName);
        }

        // JS版 bgm.js の bgmTheme() 相当。現在のモード/マップから鳴らすべきBGM名を返す。
        string BgmThemeName()
        {
            if (mode == Mode.Title) return "title";
            if (mode == Mode.Select) return "select";
            if (mode == Mode.Battle) return (foe != null && foe.m != null && foe.m.boss != 0) ? "boss" : "battle";
            if (mode == Mode.Card) return (cardText == "FIN" || cardText == "おしまい") ? "ending" : null;
            if (mode == Mode.Map && map != null)
            {
                if (map.id == "world") return "world";
                if (map.id == "castle") return "castle";
                if (map.kind == "village") return "village";
                if (!string.IsNullOrEmpty(map.id) && map.id.StartsWith("shrine")) return "shrine";
                if (map.kind == "cave") return "cave";
                return "village";
            }
            return null;
        }

        void MapUpdate()
        {
            if (moving)
            {
                float dur = DQInput.Run ? 0.09f : 0.15f;
                moveT += Time.deltaTime / dur;
                if (moveT >= 1f)
                {
                    moving = false; px = toX; py = toY; moveT = 0;
                    playerGo.transform.position = new Vector3(px, -py, 0); UpdatePlayerSprite(0);
                    busy = true; StartCoroutine(StepRoutine());
                    if (busy) return;
                }
                else
                {
                    playerGo.transform.position = new Vector3(Mathf.Lerp(fromX, toX, moveT), -Mathf.Lerp(fromY, toY, moveT), 0);
                    UpdatePlayerSprite(1 + (((int)(Time.time * 8)) & 1)); return;
                }
            }
            if (DQInput.OkE) { StartCoroutine(Interact()); return; }
            if (DQInput.CancelE) { StartCoroutine(MenuRoutine()); return; }
            int dx = 0, dy = 0, nd = -1;
            if (DQInput.Up) { dy = -1; nd = 1; } else if (DQInput.Down) { dy = 1; nd = 0; }
            else if (DQInput.Left) { dx = -1; nd = 2; } else if (DQInput.Right) { dx = 1; nd = 3; }
            if (nd < 0) return;
            dir = nd; int tx = px + dx, ty = py + dy;
            if (tx >= 0 && ty >= 0 && tx < map.w && ty < map.h && grid[ty][tx] == 'D' && NpcAt(tx, ty) == null)
            { busy = true; StartCoroutine(Wrap(OpenDoor(tx, ty))); return; }
            if (CanWalk(tx, ty)) { moving = true; moveT = 0; fromX = px; fromY = py; toX = tx; toY = ty; }
            UpdatePlayerSprite(0);
        }

        IEnumerator Wrap(IEnumerator e) { yield return e; busy = false; }

        void UpdateNpcs()
        {
            foreach (var n in npcs)
            {
                if (!n.go.activeSelf) continue;
                if (n.moving) { n.t += Time.deltaTime / 0.3f; if (n.t >= 1f) { n.moving = false; n.t = 0; } }
                else if (n.d.wander > 0 && string.IsNullOrEmpty(n.d.mon) && !busy)
                {
                    n.wait -= Time.deltaTime;
                    if (n.wait <= 0)
                    {
                        n.wait = UnityEngine.Random.Range(1.5f, 5f);
                        int d = UnityEngine.Random.Range(0, 4); n.dir = d; int nx = n.x + FX[d], ny = n.y + FY[d];
                        bool ok = Mathf.Max(Mathf.Abs(nx - n.hx), Mathf.Abs(ny - n.hy)) <= n.d.wander && nx >= 0 && ny >= 0 && nx < map.w && ny < map.h
                                  && WOK.IndexOf(grid[ny][nx]) >= 0 && NpcAt(nx, ny) == null
                                  && !(nx == px && ny == py) && !(moving && nx == toX && ny == toY);
                        if (ok) { n.fx = n.x; n.fy = n.y; n.x = nx; n.y = ny; n.moving = true; n.t = 0; }
                    }
                }
                PlaceNpc(n);
            }
        }

        void UpdateCamera()
        {
            Vector3 p = playerGo.transform.position;
            float hh = cam.orthographicSize, hw = hh * cam.aspect;
            float minX = -.5f + hw, maxX = map.w - .5f - hw, minY = -(map.h - 1) - .5f + hh, maxY = .5f - hh;
            float cx = minX > maxX ? (map.w - 1) / 2f : Mathf.Clamp(p.x, minX, maxX);
            float cy = minY > maxY ? -(map.h - 1) / 2f : Mathf.Clamp(p.y, minY, maxY);
            cam.transform.position = new Vector3(cx, cy, -10);
        }

        // ---------------- 一歩ごとの処理 ----------------
        IEnumerator StepRoutine()
        {
            char t = grid[py][px];
            if (map.kind == "world")
            {
                var w = map.warps.FirstOrDefault(q => q.x == px && q.y == py);
                if (w != null) { Sfx("open"); yield return WarpTo(w.to, w.tx, w.ty, true); busy = false; yield break; }
            }
            else if (t == 'E') { Sfx("open"); yield return WarpTo(map.retMap, map.retX, map.retY, true); busy = false; yield break; }
            float zone = 0; int rate = 0;
            if (map.kind == "world") { zone = WorldZone(px, py); rate = t == 'F' ? 9 : t == '=' ? 32 : 15; }
            else if (map.kind == "cave") { zone = map.enc; rate = 9; }
            if (rate > 0 && ++steps > 5 && UnityEngine.Random.Range(0, rate) == 0)
            {
                steps = 0;
                yield return Battle(PickFoe(zone), 0f);
                if (battleResult == "lose") yield return OnLose();
            }
            busy = false;
        }
        static float WorldZone(int x, int y) { if (y >= 20) return x < 17 ? 1 : 4; return x < 31 ? 2 : 3; }
        // ワールドマップの地方名(JS版 main.js の worldName と同一)
        static string WorldName(int x, int y) => y >= 20 ? (x < 17 ? "はじまりの 草原" : "ヨイヤミの 荒野") : (x < 31 ? "みなと街道" : "たかね高原");
        string wname;
        string MapBannerText() => map != null && map.id == "world" ? WorldName(px, py) : (map != null ? map.name : "");
        string PickFoe(float z)
        {
            var e = D.zt.FirstOrDefault(q => Mathf.Approximately(q.z, z)) ?? D.zt.First(q => Mathf.Approximately(q.z, 1f));
            return e.l[UnityEngine.Random.Range(0, e.l.Length)];
        }

        IEnumerator WarpTo(string id, int x, int y, bool doFade)
        {
            if (doFade) yield return Fade(1f, 0.22f);
            map = maps[id]; px = x; py = y; moving = false; steps = 0;
            if (map.kind == "village") home = id;
            BuildMap();
            banner = MapBannerText(); bannerT = 2.2f; wname = map.id == "world" ? WorldName(px, py) : null;
            if (doFade) yield return Fade(0f, 0.22f);
            if (mode == Mode.Map && pc != null && map.kind != "cave") AutoSave();
        }

        IEnumerator Fade(float to, float dur)
        {
            float a0 = fadeA, t = 0;
            while (t < dur) { t += Time.deltaTime; fadeA = Mathf.Lerp(a0, to, Mathf.Clamp01(t / dur)); yield return null; }
            fadeA = to;
        }

        // ---------------- 調べる・話す ----------------
        IEnumerator Interact()
        {
            busy = true;
            int tx = px + FX[dir], ty = py + FY[dir];
            bool inb = tx >= 0 && ty >= 0 && tx < map.w && ty < map.h;
            NpcRt n = inb ? NpcAt(tx, ty) : null; char t = inb ? grid[ty][tx] : ' ';
            if (n == null && (t == 'k' || t == 'J')) { tx += FX[dir]; ty += FY[dir]; inb = tx >= 0 && ty >= 0 && tx < map.w && ty < map.h; n = inb ? NpcAt(tx, ty) : null; t = inb ? grid[ty][tx] : ' '; }
            if (n != null) { int od = n.dir; n.dir = OPP[dir]; yield return TalkTo(n); n.dir = od; }
            else if (!inb) { }
            else if (t == 'D') yield return OpenDoor(tx, ty);
            else if (t == 'X') { var c = map.chests.FirstOrDefault(q => q.x == tx && q.y == ty); if (c != null) yield return OpenChest(c); }
            else if (t == 'N')
                yield return Say(map.id == "v1" ? "「ここは はじまりの村」" : map.id == "v2" ? "「みなと村　さかなが おいしい」" : map.id == "v3" ? "「たかね村　かぜが つよい」" : "「ヨイヤミ村　この さきに まおう城」");
            else
            {
                var tm = D.tilemsg.FirstOrDefault(q => q.c == t.ToString());
                if (tm != null) yield return Say(tm.t);
            }
            busy = false;
        }

        IEnumerator OpenDoor(int x, int y)
        {
            Sfx("door"); grid[y][x] = 'e'; SetTile(x, y); yield return new WaitForSeconds(.15f);
            flags.Add("door:" + map.id + ":" + x + "," + y); RefreshMap(); yield return new WaitForSeconds(.12f);
        }

        IEnumerator OpenChest(ChestDef c)
        {
            if (flags.Contains(c.id)) { yield return Say("からっぽだ。"); yield break; }
            Sfx("chest"); grid[c.y][c.x] = 'U'; SetTile(c.x, c.y); yield return new WaitForSeconds(.45f);
            flags.Add(c.id); RefreshMap();
            if (c.id == "c1b" && story == "mayor")
            {
                flags.Add("letter");
                yield return Say("はこの おくに ふるびた ふうとうが ある！\nむらちょうは『ちかいの手紙』を てにいれた！");
                yield return FinishStory(); yield break;
            }
            if (c.id == "c3b" && story == "rogue")
            {
                flags.Add("loot");
                yield return Say("へへっ、あった あった！\nぬすんだ たからだ。……ずっしり おもい。\n『げんきの玉』も はいっている！");
                AddItem("げんきの玉", 1); yield break;
            }
            if (!string.IsNullOrEmpty(c.item)) { AddItem(c.item, 1); yield return Say("たからばこを あけた！\n" + c.item + "を てにいれた！"); }
            else { int g = c.g > 0 ? c.g : 20; gold += g; yield return Say("たからばこを あけた！\n" + g + "ゴールドを みつけた！"); }
        }

        void AddItem(string n, int d) { int c; pc.items.TryGetValue(n, out c); pc.items[n] = Mathf.Max(0, c + d); }
        int ItemCount(string n) { int c; pc.items.TryGetValue(n, out c); return c; }

        // JSから書き出した会話バリエーション（フラグ/アイテムの組合せ）を再生
        IEnumerator TalkTo(NpcRt n)
        {
            var d = n.d; int mask = 0;
            for (int i = 0; i < d.tf.Length; i++)
            {
                string f = d.tf[i];
                bool has = f.StartsWith("item:") ? ItemCount(f.Substring(5)) > 0 : flags.Contains(f);
                if (has) mask |= 1 << i;
            }
            var v = d.vars.FirstOrDefault(q => q.mask == mask);
            if (v == null || v.lines.Length == 0) { yield return Say("……。"); yield break; }
            if (v.gold < 0 && gold + v.gold < 0) { yield return Say("おかねが たりないようだ……。"); yield break; }
            foreach (var l in v.lines)
            {
                if (l.k == "say") yield return Say(l.t, l.n);
                else if (l.k == "shop") yield return Shop(l.stock);
                else if (l.k == "inn") yield return Inn(l.price);
                else if (l.k == "battle")
                {
                    yield return Battle(string.IsNullOrEmpty(d.mon) ? PickFoe(3f) : d.mon, 0f);
                    if (battleResult == "lose") { yield return OnLose(); yield break; }
                    if (battleResult == "run") yield break;
                }
            }
            gold = Mathf.Max(0, gold + v.gold);
            foreach (var it in v.items) AddItem(it.n, it.d);
            foreach (var f in v.set) flags.Add(f);
            RefreshMap(); RefreshNpcs();
            if (v.finish != 0) yield return FinishStory();
        }

        string Greet(string kind) { var g = D.greet.FirstOrDefault(q => q.kind == kind && q.id == story); return g != null ? g.t : (kind == "inn" ? "ようこそ やどやへ！" : "いらっしゃい！ なにを おさがしで？"); }

        IEnumerator Inn(int price)
        {
            yield return Say(Greet("inn") + "\nひとばん " + price + "ゴールドですが おとまりに なりますか？", "やどや");
            yield return Choose(new[] { "はい", "いいえ" }, "", true, 300, 130, 130);
            if (chosen != 0) { yield return Say("また おこしください。", "やどや"); yield break; }
            if (gold < price) { yield return Say("おや、おかねが たりないようですね……", "やどや"); yield break; }
            gold -= price; yield return Fade(1f, .5f); pc.hp = pc.mhp; pc.mp = pc.mmp; Sfx("heal");
            yield return new WaitForSeconds(.5f); yield return Fade(0f, .5f);
            yield return Say("ゆうべは おたのしみでしたね！\nまた どうぞ！", "やどや");
        }

        IEnumerator Shop(StockDef[] stock)
        {
            yield return Say(Greet("shop"), "みせ");
            while (true)
            {
                var opts = stock.Select(sd => sd.n + "  " + sd.price + "G").Concat(new[] { "やめる" }).ToArray();
                yield return Choose(opts, "もちぶん " + gold + "G", true, 150, 60, 250);
                if (chosen < 0 || chosen >= stock.Length) { yield return Say("まいどあり！ また きてね！", "みせ"); yield break; }
                var s = stock[chosen];
                if (gold < s.price) { yield return Say("おかねが たりないよ。", "みせ"); continue; }
                if (s.t == "wp" && s.v <= pc.wp) { yield return Say("いまの ぶきの ほうが つよいよ。", "みせ"); continue; }
                if (s.t == "ar" && s.v <= pc.ar) { yield return Say("いまの ぼうぐの ほうが かたいよ。", "みせ"); continue; }
                gold -= s.price; Sfx("buy");
                if (s.t == "item") { AddItem(s.n, 1); yield return Say(s.n + "を てにいれた！"); }
                else if (s.t == "wp") { pc.wp = s.v; pc.wpn = s.n; yield return Say(s.n + "を そうびした！\nこうげきりょくが あがった！"); }
                else { pc.ar = s.v; pc.arn = s.n; yield return Say(s.n + "を そうびした！\nしゅびりょくが あがった！"); }
            }
        }

        // ---------------- ものがたりの流れ ----------------
        IEnumerator TitleFlow()
        {
            mode = Mode.Title; fadeA = 0f;
            while (true)
            {
                titleWait = true;
                while (!DQInput.OkE) yield return null;
                titleWait = false;
                bool any = Enumerable.Range(0, 4).Any(i => ReadSlot(i) != null);
                var opts = any ? new[] { "はじめから", "つづきから" } : new[] { "はじめから" };
                yield return Choose(opts, "", false, 170, 290, 170);
                if (chosen == 1) { yield return LoadMenu(); if (loadedOk) yield break; continue; }
                yield return SelectStory(false); yield break;
            }
        }

        List<string> ClearedList() { var s = PlayerPrefs.GetString("dq_cleared", ""); return s.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).ToList(); }
        void MarkCleared(string id) { var l = ClearedList(); if (!l.Contains(id)) { l.Add(id); PlayerPrefs.SetString("dq_cleared", string.Join(",", l)); PlayerPrefs.Save(); } }

        IEnumerator SelectStory(bool afterEnd)
        {
            mode = Mode.Select; cardText = "";
            var cl = ClearedList();
            if (cl.Count >= 7 && afterEnd && !creditsDone) { creditsDone = true; yield return Credits(); yield break; }
            if (afterEnd) yield return Say("？これは、だれの ものがたり だったのか……。\nだれかに とっては、ここからが はじまり。");
            while (true)
            {
                bool unlocked = cl.Contains("hero");
                var dis = D.order.Select((id, i) => i > 0 && !unlocked).ToArray();
                var opts = D.order.Select((id, i) => (cl.Contains(id) ? "★ " : "　") + (dis[i] ? "？？？" : chars[id].label)).ToArray();
                yield return Choose(opts, afterEnd ? "だれの じんせいを あゆむ？" : "まずは ゆうしゃを えらぼう", false, 60, 50, 392, dis);
                yield return StartStory(D.order[chosen]); yield break;
            }
        }

        Pc MkPc(string id)
        {
            var c = chars[id];
            var p = new Pc { id = id, name = c.name, lv = c.lv, exp = 0, mhp = c.hp, hp = c.hp, mmp = c.mp, mp = c.mp, atk = c.atk, def = c.df, wp = c.wp, wpn = c.wpn, ar = c.ar, arn = c.arn, spells = c.spells };
            foreach (var i in c.items) p.items[i.n] = i.d;
            return p;
        }

        IEnumerator StartStory(string id)
        {
            var c = chars[id];
            story = id; flags = new HashSet<string>(); pc = MkPc(id); gold = c.gold; home = c.map.StartsWith("v") ? c.map : "v1";
            if (id != "hero") { flags.Add("b1"); flags.Add("b2"); flags.Add("b3"); }
            yield return Fade(1f, .3f); mode = Mode.Card; cardText = c.title; yield return new WaitForSeconds(1.5f);
            mode = Mode.Map; dir = 0; moving = false;
            map = maps[c.map]; px = c.x; py = c.y; BuildMap(); banner = MapBannerText(); bannerT = 2.2f; wname = map.id == "world" ? WorldName(px, py) : null;
            cardText = ""; yield return Fade(0f, .5f); AutoSave();
            foreach (var s in c.intro) yield return Say(s, id == "hero" ? "" : c.name);
            if (id == "hero") yield return Say("(とびらは ほうこうキーで すすむと じどうで ひらく。たからばこや ひとへは Zキー／Aボタン。まずは いえの とびらを あけて むらへ でよう)");
        }

        IEnumerator FinishStory()
        {
            busy = true; var c = chars[story];
            yield return Fade(1f, .6f); mode = Mode.Card; cardText = "おしまい"; Sfx("win"); yield return Fade(0f, .3f);
            foreach (var s in c.end) yield return Say(s);
            MarkCleared(story);
            yield return Fade(1f, .5f);
            busy = false;
            yield return SelectStory(true);
        }

        IEnumerator Credits()
        {
            yield return Fade(1f, .5f); mode = Mode.Card; cardText = "FIN"; yield return Fade(0f, .5f);
            foreach (var s in new[] { "ゆうしゃ、むらびと、むらちょう、だいじん、ほこらの ひと、ギャル、ごろつき。", "だれも が、どこかの ものがたりの しゅやく だった。", "――あなたの ものがたりも、きっと。", "ありがとうございました！" })
                yield return Say(s);
            yield return Fade(1f, .6f); cardText = "";
            if (playerGo != null) playerGo.SetActive(false);
            mode = Mode.Title; yield return Fade(0f, .5f);
            yield return TitleFlow();
        }

        IEnumerator OnLose()
        {
            busy = true; yield return Fade(1f, .5f); mode = Mode.Map;
            yield return Say("めのまえが まっくらに なった……");
            gold /= 2; pc.hp = pc.mhp; pc.mp = pc.mmp;
            var h = maps[home]; yield return WarpTo(home, h.sx, h.sy, false); yield return Fade(0f, .5f);
            yield return Say(pc.name + "よ、ちからつきて しまうとは なさけない！\nおかねは はんぶんに なってしまった……。");
            busy = false;
        }

        string GoalText()
        {
            Func<string, bool> f = flags.Contains;
            switch (story)
            {
                case "hero": return !f("mayor1") ? "むらちょうに はなしを きこう（むらの いえの おく）" : !f("hermit1") ? "きたにしの はじまりの祠へ いこう" : !f("b1") ? "ねむりの洞窟（みなみ）の プルンキングを たおせ" : !f("b2") ? "みなと村の ちかくの こだまの洞窟へ。しょうしょう つよく なって から" : !f("b3") ? "たかね村の ちかくの ほのおの洞窟の ドラゴンを たおせ" : "ヨイヤミ村の ひがし、まおう城へ！";
                case "vb": return !f("med") ? "つまから くすりを うけとろう" : "みなと村の むすめに くすりを とどけよう（きたの おか を こえた むこう）";
                case "mayor": return !f("hermit1m") ? "はじまりの祠（きたにし）の ひとに はなしを きこう" : "ねむりの洞窟（みなみ）の おくの たからばこを さがせ";
                case "minister": return "『まおうとの しょるい』を まおう城へ とどけよう（ヨイヤミ村の ひがし）";
                case "hermit": return "山を おりて はじまりの村の やどやで スープを たべよう";
                case "gal": return !f("ribbon") ? "ヨイヤミ村の ブティックで リボンを もらおう" : "ステージの モデルに はなしかけよう";
                case "rogue": return !f("key") ? "ろうやの かんしゅから カギを ぬすもう" : !f("loot") ? "ほのおの洞窟の たからばこを あけろ" : !f("donated") ? "たかね村の ほくとう ほし見の祠へ たからを とどけろ" : "……";
            }
            return "";
        }

        // ---------------- セーブ / ロード（PlayerPrefs） ----------------
        void AutoSave() { if (mode == Mode.Map && pc != null && map != null) WriteSlot(0); }
        string SlotKey(int i) { return "dq_save_" + i; }
        bool WriteSlot(int i)
        {
            try
            {
                var s = new SaveData
                {
                    story = story, map = map.id, home = home, x = px, y = py, dir = dir, gold = gold, flags = flags.ToArray(), stamp = DateTime.Now.ToString("MM/dd HH:mm"),
                    pc = new PcSave { id = pc.id, name = pc.name, wpn = pc.wpn, arn = pc.arn, lv = pc.lv, exp = pc.exp, mhp = pc.mhp, hp = pc.hp, mmp = pc.mmp, mp = pc.mp, atk = pc.atk, df = pc.def, wp = pc.wp, ar = pc.ar, items = pc.items.Select(k => new ItemN { n = k.Key, d = k.Value }).ToArray() }
                };
                PlayerPrefs.SetString(SlotKey(i), JsonUtility.ToJson(s)); PlayerPrefs.Save(); return true;
            }
            catch (Exception) { return false; }
        }
        SaveData ReadSlot(int i)
        {
            var raw = PlayerPrefs.GetString(SlotKey(i), ""); if (string.IsNullOrEmpty(raw)) return null;
            try { var s = JsonUtility.FromJson<SaveData>(raw); if (s != null && s.pc != null && maps.ContainsKey(s.map) && chars.ContainsKey(s.story)) return s; } catch (Exception) { }
            return null;
        }
        string SlotLabel(int i)
        {
            var s = ReadSlot(i); string nm = i == 0 ? "オート" : "セーブ" + i;
            if (s == null) return nm + "　――からっぽ――";
            return nm + "　" + chars[s.story].label + " LV" + s.pc.lv + "　" + maps[s.map].name;
        }
        void ApplySave(SaveData s)
        {
            story = s.story; flags = new HashSet<string>(s.flags ?? new string[0]); gold = s.gold; home = string.IsNullOrEmpty(s.home) ? "v1" : s.home;
            var p = s.pc; pc = new Pc { id = p.id, name = p.name, wpn = p.wpn, arn = p.arn, lv = p.lv, exp = p.exp, mhp = p.mhp, hp = p.hp, mmp = p.mmp, mp = p.mp, atk = p.atk, def = p.df, wp = p.wp, ar = p.ar, spells = chars[s.story].spells };
            foreach (var it in p.items) pc.items[it.n] = it.d;
            map = maps[s.map]; px = s.x; py = s.y; dir = s.dir; moving = false; steps = 0;
            BuildMap(); banner = MapBannerText(); bannerT = 2.2f; wname = map.id == "world" ? WorldName(px, py) : null;
        }
        bool loadedOk;
        IEnumerator SaveMenu()
        {
            yield return Choose(new[] { 1, 2, 3 }.Select(SlotLabel).Concat(new[] { "やめる" }).ToArray(), "どこに セーブする？", true, 20, 60, 470);
            if (chosen < 0 || chosen > 2) yield break;
            int slot = chosen + 1;
            if (ReadSlot(slot) != null) { yield return Choose(new[] { "うわがきする", "やめる" }, "", true, 300, 130, 170); if (chosen != 0) yield break; }
            Sfx("buy"); yield return Say(WriteSlot(slot) ? "ぼうけんの しょを きろくした！" : "セーブに しっぱいした……。");
        }
        IEnumerator LoadMenu()
        {
            loadedOk = false;
            var have = Enumerable.Range(0, 4).Where(i => ReadSlot(i) != null).ToList();
            if (have.Count == 0) { yield return Say("セーブデータが ない。"); yield break; }
            var dis = Enumerable.Range(0, 4).Select(i => ReadSlot(i) == null).Concat(new[] { false }).ToArray();
            yield return Choose(Enumerable.Range(0, 4).Select(SlotLabel).Concat(new[] { "やめる" }).ToArray(), "どれを ロードする？", true, 20, 50, 470, dis);
            if (chosen < 0 || chosen > 3) yield break;
            var s = ReadSlot(chosen); if (s == null) yield break;
            yield return Fade(1f, .3f); mode = Mode.Map; ApplySave(s); cardText = ""; yield return Fade(0f, .3f);
            loadedOk = true;
        }

        // ---------------- フィールドメニュー ----------------
        IEnumerator MenuRoutine()
        {
            busy = true;
            while (true)
            {
                yield return Choose(new[] { "じゅもん", "どうぐ", "つよさ", "もくてき", "セーブ", "ロード", "とじる" }, "", true, 12, 84, 160);
                int i = chosen; if (i < 0 || i == 6) break;
                if (i == 0)
                {
                    var sps = pc.spells.Where(s => s.lv <= pc.lv && s.t == "heal").ToArray();
                    if (sps.Length == 0) { yield return Say("いま つかえる じゅもんが ない。"); continue; }
                    yield return Choose(sps.Select(s => s.n + " MP" + s.mp).ToArray(), "", true, 176, 84, 250);
                    if (chosen >= 0) yield return UseSpell(sps[chosen], false);
                }
                else if (i == 1)
                {
                    var names = pc.items.Where(k => k.Value > 0).Select(k => k.Key).ToArray();
                    if (names.Length == 0) { yield return Say("どうぐを もっていない。"); continue; }
                    yield return Choose(names.Select(n => n + " x" + pc.items[n]).ToArray(), "", true, 176, 84, 250);
                    if (chosen >= 0) yield return UseItem(names[chosen]);
                }
                else if (i == 2)
                {
                    yield return Say(pc.name + "　LV " + pc.lv + "\nHP " + pc.hp + "/" + pc.mhp + "　MP " + pc.mp + "/" + pc.mmp + "\nちから " + pc.atk + "　まもり " + pc.def);
                    yield return Say("ぶき：" + pc.wpn + "\nぼうぐ：" + pc.arn + "\nつぎの レベルまで " + (Need(pc.lv) - pc.exp) + "　" + gold + "G");
                }
                else if (i == 3) yield return Say("いまの もくてき：\n" + GoalText());
                else if (i == 4) yield return SaveMenu();
                else if (i == 5)
                {
                    yield return LoadMenu();
                    if (loadedOk) break;
                }
            }
            busy = false;
        }
    }
}
