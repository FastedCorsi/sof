#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "SeaOfFireHealthComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FSeaOfFireHealthChanged, float, CurrentHp, float, MaxHp, bool, bIsDead);

UCLASS(ClassGroup=(SeaOfFire), meta=(BlueprintSpawnableComponent))
class SEAOFFIRE_API USeaOfFireHealthComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    USeaOfFireHealthComponent();

    UPROPERTY(BlueprintAssignable, Category="Sea of Fire|Health")
    FSeaOfFireHealthChanged OnHealthChanged;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category="Sea of Fire|Health")
    float MaxHp = 100.0f;

    UPROPERTY(BlueprintReadOnly, Category="Sea of Fire|Health")
    float CurrentHp = 100.0f;

    UFUNCTION(BlueprintCallable, Category="Sea of Fire|Health")
    void ApplyServerHealth(float NewHp, float NewMaxHp);

    UFUNCTION(BlueprintCallable, Category="Sea of Fire|Health")
    bool IsDead() const;

    UFUNCTION(BlueprintCallable, Category="Sea of Fire|Health")
    float GetHealthRatio() const;
};

