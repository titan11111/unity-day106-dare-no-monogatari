#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

namespace DareNoMonogatari.Editor
{
    // Resources/Tiles|Chars|Monsters のPNGをドット絵向け設定(Point/無圧縮/ミップなし)で取り込む
    public class DQTextureImporter : AssetPostprocessor
    {
        void OnPreprocessTexture()
        {
            string p = assetPath.Replace('\\', '/');
            if (!p.Contains("/Resources/Tiles/") && !p.Contains("/Resources/Chars/") && !p.Contains("/Resources/Monsters/")) return;
            var ti = (TextureImporter)assetImporter;
            ti.textureType = TextureImporterType.Default; ti.alphaIsTransparency = true; ti.mipmapEnabled = false;
            ti.filterMode = FilterMode.Point; ti.textureCompression = TextureImporterCompression.Uncompressed;
            ti.npotScale = TextureImporterNPOTScale.None; ti.maxTextureSize = 2048; ti.isReadable = false;
        }
    }
}
#endif
