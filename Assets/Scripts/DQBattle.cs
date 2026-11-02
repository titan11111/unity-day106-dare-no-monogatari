using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace DareNoMonogatari
{
    // 正面ビューの1対1バトル（JS版の battle.js を移植）
    public partial class DQGame
    {
        class Foe { public MonDef m; public int hp, stun; public bool stolen, vis = true; public float a = 1f, big = 1f; }
        Foe foe; string battleResult = ""; Texture2D monTex, gradTex; bool useOk;

        static int Need(int lv) { return lv * lv * 2 + lv * 6; }

        void BuildGrad()
        {
            int k = map.kind == "world" ? (int)WorldZone(px, py) : Mathf.FloorToInt(map.enc);
            k = Mathf.Clamp(k, 1, 4);
            var bg = D.bg.FirstOrDefault(b => b.k == k) ?? D.bg[0];
            Color c0; if (!ColorUtility.TryParseHtmlString(bg.c, out c0)) c0 = new Color(.1f, .1f, .2f);
            if (gradTex == null) { gradTex = new Texture2D(1, 32, TextureFormat.RGBA32, false); gradTex.filterMode = FilterMode.Bilinear; }
            for (int i = 0; i < 32; i++) gradTex.SetPixel(0, i, Color.Lerp(Color.black, c0, i / 31f));   // 下=黒 上=色
            gradTex.Apply();
        }

        void DrawBattle()
        {
            Fill(new Rect(0, 0, Screen.width, Screen.height), Color.black);
            Box(176, 10, 326, 300);
            if (gradTex != null) GUI.DrawTexture(Rc(186, 20, 306, 280), gradTex);
            if (foe != null && foe.vis && monTex != null && foe.a > 0)
            {
                var o = GUI.color; GUI.color = new Color(1, 1, 1, foe.a);
                float bob = Mathf.Sin(Time.time * 5f) * 3f;
                GUI.DrawTexture(Rc(174, 20 + bob, 330, 300), monTex);
                GUI.color = o;
            }
            Box(12, 10, 150, 86);
            Txt(20, 12, pc.name, 16); Txt(20, 34, "LV " + pc.lv, 15); Txt(20, 54, "HP " + pc.hp + "/" + pc.mhp, 15); Txt(20, 72, "MP " + pc.mp + "/" + pc.mmp, 15);
        }

        IEnumerator PcDamage(int n) { Sfx("hit"); shake = .3f; pc.hp = Mathf.Max(0, pc.hp - n); yield return new WaitForSeconds(.26f); }
        IEnumerator FoeBlink() { for (int i = 0; i < 6; i++) { foe.vis = !foe.vis; yield return new WaitForSeconds(.055f); } foe.vis = true; }
        static int DmgOf(float atk, float def, int v = 4) { return Mathf.Max(1, Mathf.FloorToInt(atk - def / 2f + Mathf.Floor(UnityEngine.Random.value * Mathf.Max(2f, atk / v)))); }

        IEnumerator UseSpell(SpellDef sp, bool inB)
        {
            useOk = false;
            if (pc.mp < sp.mp) { yield return Say("MPが たりない！"); yield break; }
            pc.mp -= sp.mp;
            if (sp.t == "heal")
            {
                int v = sp.p + RndI(Mathf.CeilToInt(sp.p / 4f)); pc.hp = Mathf.Min(pc.mhp, pc.hp + v); Sfx("heal");
                yield return Say(pc.name + "は " + sp.n + "を となえた！\nHPが " + v + " かいふくした！"); useOk = true; yield break;
            }
            if (!inB) { pc.mp += sp.mp; yield return Say("いまは つかえない！"); yield break; }
            yield return Say(pc.name + "は " + sp.n + "！");
            if (sp.t == "atk")
            {
                int d = Mathf.Max(3, sp.p + RndI(Mathf.CeilToInt(sp.p / 3f)) - foe.m.df / 4);
                Sfx("crit"); yield return FoeBlink(); foe.hp -= d; yield return Say(foe.m.n + "に " + d + "の ダメージ！");
            }
            else if (sp.t == "stun")
            {
                if (foe.m.boss != 0 && RndI(3) > 0) yield return Say("しかし こうかが なかった！");
                else if (RndI(10) < (sp.pr > 0 ? sp.pr : 7)) { foe.stun = 3; yield return Say(foe.m.n + "は うっとりして うごけない！"); }
                else yield return Say("しかし こうかが なかった！");
            }
            else if (sp.t == "steal")
            {
                if (foe.stolen || foe.m.boss != 0) yield return Say("しかし なにも ぬすめなかった！");
                else { foe.stolen = true; int g = Mathf.Max(5, Mathf.FloorToInt(foe.m.g * 1.5f)); gold += g; Sfx("buy"); yield return Say(g + "Gを ぬすんだ！"); }
            }
            useOk = true;
        }

        IEnumerator UseItem(string name)
        {
            useOk = false;
            var fx = D.itemfx.FirstOrDefault(f => f.n == name);
            if (fx == null || ItemCount(name) <= 0) { yield return Say("いまは つかえない！"); yield break; }
            AddItem(name, -1); Sfx("heal");
            if (fx.full != 0) { pc.hp = pc.mhp; pc.mp = pc.mmp; yield return Say(name + "が かがやいた！\nHPとMPが ぜんかいふくした！"); useOk = true; yield break; }
            int v = fx.hp + RndI(fx.v > 0 ? fx.v : 1); pc.hp = Mathf.Min(pc.mhp, pc.hp + v);
            string t = pc.name + "は " + name + "を つかった！\nHPが " + v + " かいふくした！";
            if (fx.mp > 0) { pc.mp = Mathf.Min(pc.mmp, pc.mp + fx.mp); t += "\nMPも " + fx.mp + " かいふくした！"; }
            yield return Say(t); useOk = true;
        }

        IEnumerator GainExp(int exp)
        {
            pc.exp += exp;
            while (pc.exp >= Need(pc.lv) && pc.lv < 30)
            {
                pc.exp -= Need(pc.lv); pc.lv++; pc.mhp += D.gr.hp; pc.mmp += D.gr.mp; pc.atk += D.gr.atk; pc.def += D.gr.def; Sfx("lvl");
                yield return Say(pc.name + "は レベルが " + pc.lv + "に あがった！");
                foreach (var sp in pc.spells) if (sp.lv == pc.lv) yield return Say(sp.n + "を おぼえた！");
            }
        }

        IEnumerator Battle(string key, float unused)
        {
            var m = mons[key]; foe = new Foe { m = m, hp = m.hp, big = m.sz > 0 ? m.sz : 1f };
            BuildGrad(); monTex = Tex("Monsters/" + key); mode = Mode.Battle; battleResult = ""; Sfx("enc");
            yield return new WaitForSeconds(.2f);
            yield return Say(m.boss != 0 ? m.n + "が たちふさがった！" : m.n + "が あらわれた！");
            int turn = 0;
            while (true)
            {
                turn++;
                yield return Choose(new[] { "たたかう", "じゅもん", "どうぐ", "にげる" }, "", false, 12, 128, 150);
                int cmd = chosen; bool acted = true;
                if (cmd == 0)
                {
                    yield return Say(pc.name + "の こうげき！");
                    bool crit = RndI(14) == 0; int d = DmgOf(pc.atk + pc.wp, m.df, 3);
                    if (crit) d = Mathf.FloorToInt(pc.atk + pc.wp + RndI(8) + 4);
                    if (RndI(20) == 0) yield return Say("ミス！ ダメージを あたえられない！");
                    else { Sfx(crit ? "crit" : "hit"); yield return FoeBlink(); foe.hp -= d; yield return Say((crit ? "かいしんの いちげき！\n" : "") + m.n + "に " + d + "の ダメージ！"); }
                }
                else if (cmd == 1)
                {
                    var sps = pc.spells.Where(s => s.lv <= pc.lv).ToArray();
                    if (sps.Length == 0) { yield return Say("おぼえている じゅもんが ない！"); acted = false; }
                    else
                    {
                        yield return Choose(sps.Select(s => s.n + " MP" + s.mp).ToArray(), "", true, 176, 130, 300);
                        if (chosen < 0) acted = false; else { yield return UseSpell(sps[chosen], true); acted = useOk; }
                    }
                }
                else if (cmd == 2)
                {
                    var names = pc.items.Where(k => k.Value > 0).Select(k => k.Key).ToArray();
                    if (names.Length == 0) { yield return Say("どうぐを もっていない！"); acted = false; }
                    else
                    {
                        yield return Choose(names.Select(n => n + " x" + pc.items[n]).ToArray(), "", true, 176, 130, 300);
                        if (chosen < 0) acted = false; else { yield return UseItem(names[chosen]); acted = useOk; }
                    }
                }
                else
                {
                    if (m.boss != 0) yield return Say("にげられない！");
                    else if (RndI(4) > 0) { yield return Say(pc.name + "は にげだした！"); foe = null; mode = Mode.Map; battleResult = "run"; yield break; }
                    else yield return Say("しかし まわりこまれてしまった！");
                }
                if (!acted) { turn--; continue; }
                if (foe.hp <= 0)
                {
                    for (float a = 1f; a > 0; a -= .1f) { foe.a = Mathf.Max(0, a); yield return new WaitForSeconds(.04f); }
                    Sfx("win"); yield return Say(m.n + "を たおした！");
                    if (m.exp > 0 || m.g > 0)
                    {
                        gold += m.g; yield return Say(m.exp + "ポイントの けいけんちを かくとく！\n" + m.g + "ゴールドを てにいれた！"); yield return GainExp(m.exp);
                    }
                    foe = null; mode = Mode.Map; battleResult = "win"; yield break;
                }
                if (foe.stun > 0) { foe.stun--; yield return Say(m.n + "は うごけない！"); continue; }
                if (m.boss != 0 && turn % 3 == 0)
                {
                    yield return Say(m.n + "の " + m.sp + "！");
                    int d = Mathf.Max(5, Mathf.FloorToInt(m.atk * (.8f + RndI(30) / 100f) - (pc.def + pc.ar) / 3f));
                    yield return PcDamage(d); yield return Say(pc.name + "は " + d + "の ダメージを うけた！");
                }
                else if (RndI(18) == 0) yield return Say(m.n + "の こうげき！\nひらりと みをかわした！");
                else
                {
                    yield return Say(m.n + "の こうげき！");
                    int d = DmgOf(m.atk, pc.def + pc.ar, 5);
                    yield return PcDamage(d); yield return Say(pc.name + "は " + d + "の ダメージを うけた！");
                }
                if (pc.hp <= 0) { yield return Say(pc.name + "は ちからつきた……"); foe = null; mode = Mode.Map; battleResult = "lose"; yield break; }
            }
        }
    }
}
