#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PawnMovementComponent.h"
#include "SeaOfFireMovementComponent.generated.h"

UCLASS(ClassGroup=(SeaOfFire), meta=(BlueprintSpawnableComponent))
class SEAOFFIRE_API USeaOfFireMovementComponent : public UPawnMovementComponent
{
    GENERATED_BODY()

public:
    USeaOfFireMovementComponent();

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Sea of Fire|Movement")
    float MaxSpeed = 360.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Sea of Fire|Movement")
    float DestinationAcceptanceRadius = 35.0f;

    UPROPERTY(BlueprintReadOnly, Category="Sea of Fire|Movement")
    bool bHasClickDestination = false;

    UPROPERTY(BlueprintReadOnly, Category="Sea of Fire|Movement")
    FVector ClickDestination = FVector::ZeroVector;

    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

    UFUNCTION(BlueprintCallable, Category="Sea of Fire|Movement")
    void SetClickDestination(const FVector& WorldDestination);

    UFUNCTION(BlueprintCallable, Category="Sea of Fire|Movement")
    void ClearClickDestination();
};

