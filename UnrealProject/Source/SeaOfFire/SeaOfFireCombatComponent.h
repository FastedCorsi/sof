#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "SeaOfFireCombatComponent.generated.h"

UENUM(BlueprintType)
enum class ESeaOfFireFireBlockReason : uint8
{
    None,
    Reload,
    OutOfRange,
    NoAmmo,
    TargetDead,
    ServerRejected
};

UCLASS(ClassGroup=(SeaOfFire), meta=(BlueprintSpawnableComponent))
class SEAOFFIRE_API USeaOfFireCombatComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    USeaOfFireCombatComponent();

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category="Sea of Fire|Combat")
    float CannonRange = 850.0f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category="Sea of Fire|Combat")
    float ReloadSeconds = 3.5f;

    UPROPERTY(BlueprintReadOnly, Category="Sea of Fire|Combat")
    float LastFireTime = -1000.0f;

    UFUNCTION(BlueprintCallable, Category="Sea of Fire|Combat")
    bool CanFire(float WorldTimeSeconds, ESeaOfFireFireBlockReason& OutReason) const;

    UFUNCTION(BlueprintCallable, Category="Sea of Fire|Combat")
    void MarkLocalFireAttempt(float WorldTimeSeconds);

    UFUNCTION(BlueprintCallable, Category="Sea of Fire|Combat")
    float GetReloadRemaining(float WorldTimeSeconds) const;
};

