using UnityEngine;
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem;
#endif

namespace DareNoMonogatari
{
    // 新Input System / 旧Input Manager どちらでも動く入力（キーボード + ゲームパッド）
    public static class DQInput
    {
        public static bool Up, Down, Left, Right, Run;                 // 押しっぱなし
        public static bool OkE, CancelE, UpE, DownE, LeftE, RightE;    // このフレームに押された
        static bool pOk, pCa, pU, pD, pL, pR;

        public static void Poll()
        {
            bool u = false, d = false, l = false, r = false, ok = false, ca = false, run = false;
#if ENABLE_INPUT_SYSTEM
            var k = Keyboard.current;
            if (k != null)
            {
                u |= k.upArrowKey.isPressed || k.wKey.isPressed;
                d |= k.downArrowKey.isPressed || k.sKey.isPressed;
                l |= k.leftArrowKey.isPressed || k.aKey.isPressed;
                r |= k.rightArrowKey.isPressed || k.dKey.isPressed;
                ok |= k.zKey.isPressed || k.enterKey.isPressed || k.spaceKey.isPressed;
                ca |= k.xKey.isPressed || k.escapeKey.isPressed || k.backspaceKey.isPressed;
                run |= k.leftShiftKey.isPressed || k.rightShiftKey.isPressed;
            }
            var g = Gamepad.current;
            if (g != null)
            {
                var dp = g.dpad; var ls = g.leftStick.ReadValue();
                u |= dp.up.isPressed || ls.y > 0.5f;
                d |= dp.down.isPressed || ls.y < -0.5f;
                l |= dp.left.isPressed || ls.x < -0.5f;
                r |= dp.right.isPressed || ls.x > 0.5f;
                ok |= g.buttonSouth.isPressed;      // Switch Pro: B位置 / Xbox: A
                ca |= g.buttonEast.isPressed;       // Switch Pro: A位置 / Xbox: B
                run |= g.rightShoulder.isPressed || g.leftShoulder.isPressed;
            }
#endif
#if ENABLE_LEGACY_INPUT_MANAGER
            u |= Input.GetKey(KeyCode.UpArrow) || Input.GetKey(KeyCode.W);
            d |= Input.GetKey(KeyCode.DownArrow) || Input.GetKey(KeyCode.S);
            l |= Input.GetKey(KeyCode.LeftArrow) || Input.GetKey(KeyCode.A);
            r |= Input.GetKey(KeyCode.RightArrow) || Input.GetKey(KeyCode.D);
            // Nintendo系パッド(Hori等)はボタン順が標準と違うため、JS版core.jsのpollPadと同じ割り当てに合わせる: A(決定)=index1/3/9, B(キャンセル)=index0/2/8
            ok |= Input.GetKey(KeyCode.Z) || Input.GetKey(KeyCode.Return) || Input.GetKey(KeyCode.Space)
                || Input.GetKey(KeyCode.JoystickButton1) || Input.GetKey(KeyCode.JoystickButton3) || Input.GetKey(KeyCode.JoystickButton9);
            ca |= Input.GetKey(KeyCode.X) || Input.GetKey(KeyCode.Escape) || Input.GetKey(KeyCode.Backspace)
                || Input.GetKey(KeyCode.JoystickButton0) || Input.GetKey(KeyCode.JoystickButton2) || Input.GetKey(KeyCode.JoystickButton8);
            run |= Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift)
                || Input.GetKey(KeyCode.JoystickButton4) || Input.GetKey(KeyCode.JoystickButton5)
                || Input.GetKey(KeyCode.JoystickButton6) || Input.GetKey(KeyCode.JoystickButton7);
            float ax = Input.GetAxisRaw("Horizontal"), ay = Input.GetAxisRaw("Vertical");
            l |= ax < -0.5f; r |= ax > 0.5f; d |= ay < -0.5f; u |= ay > 0.5f;
            JoyDiag(ax, ay);
#endif
            Up = u; Down = d; Left = l; Right = r; Run = run;
            OkE = ok && !pOk; CancelE = ca && !pCa; UpE = u && !pU; DownE = d && !pD; LeftE = l && !pL; RightE = r && !pR;
            pOk = ok; pCa = ca; pU = u; pD = d; pL = l; pR = r;
        }

#if ENABLE_LEGACY_INPUT_MANAGER
        // ホリ等Switchコン診断用。接続有無・軸値・押下ボタン番号を1秒おきにログ出力する(一時デバッグ)。
        static float diagT;
        static void JoyDiag(float ax, float ay)
        {
            diagT -= Time.deltaTime;
            if (diagT > 0) return;
            diagT = 1f;
            var names = Input.GetJoystickNames();
            int connected = 0; string nameList = "";
            foreach (var n in names) if (!string.IsNullOrEmpty(n)) { connected++; nameList += "[" + n + "]"; }
            if (connected == 0) { Debug.Log("[JoyDiag] ジョイスティック未検出(GetJoystickNames=0件)"); return; }
            string pressed = "";
            for (int i = 0; i < 20; i++) if (Input.GetKey(KeyCode.JoystickButton0 + i)) pressed += i + ",";
            Debug.Log($"[JoyDiag] 接続:{connected} 名前:{nameList} Horizontal:{ax:F2} Vertical:{ay:F2} 押下ボタン番号:[{pressed}]");
        }
#endif
    }
}
