#include "SeaOfFireCombatComponent.h"

USeaOfFireCombatComponent::USeaOfFireCombatComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

bool USeaOfFireCombatComponent::CanFire(float WorldTimeSeconds, ESeaOfFireFireBlockReason& OutReason) const
{
    if (GetReloadRemaining(WorldTimeSeconds) > 0.0f)
    {
        OutReason = ESeaOfFireFireBlockReason::Reload;
        return false;
    }

    OutReason = ESeaOfFireFireBlockReason::None;
    return true;
}

void USeaOfFireCombatComponent::MarkLocalFireAttempt(float WorldTimeSeconds)
{
    LastFireTime = WorldTimeSeconds;
}

float USeaOfFireCombatComponent::GetReloadRemaining(float WorldTimeSeconds) const
{
    return FMath::Max(0.0f, ReloadSeconds - (WorldTimeSeconds - LastFireTime));
}

