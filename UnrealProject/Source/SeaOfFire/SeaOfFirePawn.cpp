#include "SeaOfFirePawn.h"

#include "Camera/CameraComponent.h"
#include "Components/StaticMeshComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "SeaOfFireCombatComponent.h"
#include "SeaOfFireHealthComponent.h"
#include "SeaOfFireMovementComponent.h"
#include "SeaOfFireNetworkClient.h"

ASeaOfFirePawn::ASeaOfFirePawn()
{
    PrimaryActorTick.bCanEverTick = true;
    bUseControllerRotationYaw = false;

    BodyMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("BodyMesh"));
    RootComponent = BodyMesh;
    BodyMesh->SetCollisionProfileName(TEXT("Pawn"));

    SeaMovement = CreateDefaultSubobject<USeaOfFireMovementComponent>(TEXT("SeaMovement"));
    SeaMovement->UpdatedComponent = BodyMesh;

    Health = CreateDefaultSubobject<USeaOfFireHealthComponent>(TEXT("Health"));
    Combat = CreateDefaultSubobject<USeaOfFireCombatComponent>(TEXT("Combat"));
    NetworkClient = CreateDefaultSubobject<USeaOfFireNetworkClient>(TEXT("NetworkClient"));

    CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
    CameraBoom->SetupAttachment(RootComponent);
    CameraBoom->TargetArmLength = 1600.0f;
    CameraBoom->SetRelativeRotation(FRotator(-58.0f, 0.0f, 0.0f));
    CameraBoom->bDoCollisionTest = false;
    CameraBoom->bEnableCameraLag = true;
    CameraBoom->CameraLagSpeed = 16.0f;

    TopDownCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("TopDownCamera"));
    TopDownCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
    TopDownCamera->FieldOfView = 50.0f;

    AutoPossessPlayer = EAutoReceiveInput::Player0;
}

UPawnMovementComponent* ASeaOfFirePawn::GetMovementComponent() const
{
    return SeaMovement;
}

void ASeaOfFirePawn::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);
    PlayerInputComponent->BindAxis(TEXT("MoveForward"), this, &ASeaOfFirePawn::MoveForward);
    PlayerInputComponent->BindAxis(TEXT("MoveRight"), this, &ASeaOfFirePawn::MoveRight);
    PlayerInputComponent->BindAxis(TEXT("Zoom"), this, &ASeaOfFirePawn::ApplyZoomInput);
}

void ASeaOfFirePawn::ApplyZoomInput(float ZoomDelta)
{
    if (FMath::IsNearlyZero(ZoomDelta))
    {
        return;
    }

    const float NewLength = FMath::Clamp(CameraBoom->TargetArmLength - ZoomDelta * 80.0f, MinZoomArmLength, MaxZoomArmLength);
    CameraBoom->TargetArmLength = NewLength;
}

void ASeaOfFirePawn::MoveForward(float Value)
{
    if (!FMath::IsNearlyZero(Value))
    {
        AddMovementInput(FVector::ForwardVector, Value);
    }
}

void ASeaOfFirePawn::MoveRight(float Value)
{
    if (!FMath::IsNearlyZero(Value))
    {
        AddMovementInput(FVector::RightVector, Value);
    }
}

