using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;

public static class TitanBuild
{
    const string ScenePath = "Assets/Scenes/Main.unity";

    [MenuItem("Titan/Create Starter Scene")]
    public static void CreateScene()
    {
        if (File.Exists(ScenePath))
        {
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
            return;
        }
        Directory.CreateDirectory("Assets/Scenes");
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        EditorSceneManager.SaveScene(scene, ScenePath);
        EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
        AssetDatabase.SaveAssets();
        Debug.Log("Starter scene created: " + ScenePath);
    }

    [MenuItem("Titan/Build Web")]
    public static void BuildWeb()
    {
        if (!BuildPipeline.IsBuildTargetSupported(BuildTargetGroup.WebGL, BuildTarget.WebGL))
            throw new BuildFailedException("Install Web Build Support for this exact Unity version in Unity Hub.");
        CreateScene();
        if (!EditorUserBuildSettings.SwitchActiveBuildTarget(BuildTargetGroup.WebGL, BuildTarget.WebGL))
            throw new BuildFailedException("Could not switch to Web target.");
        PlayerSettings.productName = "だれの ものがたり？";
        PlayerSettings.companyName = "Titan";
        PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Disabled;
        PlayerSettings.WebGL.decompressionFallback = false;
        PlayerSettings.defaultWebScreenWidth = 512; PlayerSettings.defaultWebScreenHeight = 448;
        string day = Directory.GetParent(Application.dataPath).Parent.FullName;
        string output = Path.Combine(day, "Builds", "WebGL");
        Directory.CreateDirectory(output);
        var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions {
            scenes = new[] { ScenePath }, locationPathName = output, target = BuildTarget.WebGL, options = BuildOptions.None
        });
        if (report.summary.result != BuildResult.Succeeded) throw new BuildFailedException("Web build failed; inspect Console/log.");
        Debug.Log("TITAN_WEB_BUILD_SUCCESS: " + output + " size=" + report.summary.totalSize);
    }
}
