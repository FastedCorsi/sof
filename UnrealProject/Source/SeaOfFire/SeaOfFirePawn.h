#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Pawn.h"
#include "SeaOfFirePawn.generated.h"

class UCameraComponent;
class USeaOfFireCombatComponent;
class USeaOfFireHealthComponent;
class USeaOfFireMovementComponent;
class USeaOfFireNetworkClient;
class USpringArmComponent;
class UStaticMeshComponent;

UCLASS()
class SEAOFFIRE_API ASeaOfFirePawn : public APawn
{
    GENERATED_BODY()

public:
    ASeaOfFirePawn();

    virtual UPawnMovementComponent* GetMovementComponent() const override;
    virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Sea of Fire|Components")
    UStaticMeshComponent* BodyMesh;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Sea of Fire|Components")
    USpringArmComponent* CameraBoom;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Sea of Fire|Components")
    UCameraComponent* TopDownCamera;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Sea of Fire|Components")
    USeaOfFireMovementComponent* SeaMovement;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Sea of Fire|Components")
    USeaOfFireHealthComponent* Health;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Sea of Fire|Components")
    USeaOfFireCombatComponent* Combat;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Sea of Fire|Components")
    USeaOfFireNetworkClient* NetworkClient;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Sea of Fire|Camera")
    float MinZoomArmLength = 1450.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Sea of Fire|Camera")
    float MaxZoomArmLength = 1750.0f;

    UFUNCTION(BlueprintCallable, Category="Sea of Fire|Camera")
    void ApplyZoomInput(float ZoomDelta);

private:
    void MoveForward(float Value);
    void MoveRight(float Value);
};

