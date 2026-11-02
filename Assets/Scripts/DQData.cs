using System;
using System.Collections.Generic;

// データ定義：Resources/Data/gamedata.json（JS版から書き出し）を JsonUtility で読む
namespace DareNoMonogatari
{
    [Serializable] public class GameData
    {
        public TileMsg[] tilemsg; public ZoneT[] zt; public GreetDef[] greet;
        public MapDef[] maps; public MonDef[] mons; public CharDef[] chars; public StoryDef[] stories;
        public ShopDef[] shops; public ItemFx[] itemfx; public BgDef[] bg; public BossDef[] boss;
        public string[] order; public GrDef gr;
    }
    [Serializable] public class TileMsg { public string c; public string t; }
    [Serializable] public class ZoneT { public float z; public string[] l; }
    [Serializable] public class GreetDef { public string kind; public string id; public string t; }
    [Serializable] public class GrDef { public int hp, mp, atk, def; }
    [Serializable] public class WarpDef { public int x, y; public string to; public int tx, ty; }
    [Serializable] public class ChestDef { public string id; public int x, y; public string item; public int g; }
    [Serializable] public class DynDef { public int x, y; public string fl, on, off; }
    [Serializable] public class MapDef
    {
        public string id, name, kind, floor, retMap; public int w, h, sx, sy, retX, retY, bossId, bossX, bossY;
        public float enc; public string[] rows; public WarpDef[] warps; public ChestDef[] chests; public DynDef[] dyn;
    }
    [Serializable] public class MonDef { public string key, n, sp; public int hp, atk, df, exp, g, boss; public float sz; }
    [Serializable] public class ItemN { public string n; public int d; }
    [Serializable] public class SpellDef { public string n, t; public int mp, p, lv, pr; }
    [Serializable] public class CharDef
    {
        public string id, name, label, spr, wpn, arn, map, title; public int lv, hp, mp, atk, df, wp, ar, gold, x, y;
        public ItemN[] items; public SpellDef[] spells; public string[] intro, end;
    }
    [Serializable] public class StockDef { public string n, t; public int price, v; }
    [Serializable] public class ShopDef { public string map; public StockDef[] stock; }
    [Serializable] public class ItemFx { public string n; public int hp, v, mp, full; }
    [Serializable] public class BgDef { public int k; public string c; }
    [Serializable] public class BossDef { public int id; public string key; public float k; }
    [Serializable] public class LineDef { public string k, n, t; public string[] opts; public int price; public StockDef[] stock; }
    [Serializable] public class VarDef { public int mask; public LineDef[] lines; public string[] set; public int gold; public ItemN[] items; public int finish; }
    [Serializable] public class NpcDef
    {
        public string id, map, spr, mon; public int x, y, dir, wander; public float mk;
        public string[] sf; public bool[] st; public string[] tf; public VarDef[] vars;
    }
    [Serializable] public class StoryDef { public string id; public NpcDef[] npcs; }

    // ---- セーブ ----
    [Serializable] public class PcSave
    {
        public string id, name, wpn, arn; public int lv, exp, mhp, hp, mmp, mp, atk, df, wp, ar; public ItemN[] items;
    }
    [Serializable] public class SaveData
    {
        public int ver = 1; public string story, map, home, stamp; public int x, y, dir, gold; public string[] flags; public PcSave pc;
    }

    public class Pc
    {
        public string id, name, wpn, arn; public int lv, exp, mhp, hp, mmp, mp, atk, def, wp, ar;
        public Dictionary<string, int> items = new Dictionary<string, int>();
        public SpellDef[] spells;
    }
}
