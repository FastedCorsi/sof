#include "SeaOfFireHealthComponent.h"

USeaOfFireHealthComponent::USeaOfFireHealthComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

void USeaOfFireHealthComponent::ApplyServerHealth(float NewHp, float NewMaxHp)
{
    MaxHp = FMath::Max(1.0f, NewMaxHp);
    CurrentHp = FMath::Clamp(NewHp, 0.0f, MaxHp);
    OnHealthChanged.Broadcast(CurrentHp, MaxHp, IsDead());
}

bool USeaOfFireHealthComponent::IsDead() const
{
    return CurrentHp <= 0.0f;
}

float USeaOfFireHealthComponent::GetHealthRatio() const
{
    return MaxHp > 0.0f ? CurrentHp / MaxHp : 0.0f;
}

