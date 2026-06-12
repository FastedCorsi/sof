using UnrealBuildTool;

public class SeaOfFire : ModuleRules
{
    public SeaOfFire(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(new[]
        {
            "Core",
            "CoreUObject",
            "Engine",
            "InputCore",
            "EnhancedInput",
            "UMG",
            "HTTP",
            "Json",
            "JsonUtilities",
            "WebSockets"
        });
    }
}

