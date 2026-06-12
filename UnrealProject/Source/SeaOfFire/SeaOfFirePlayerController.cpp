#include "SeaOfFirePlayerController.h"

#include "SeaOfFireMovementComponent.h"

ASeaOfFirePlayerController::ASeaOfFirePlayerController()
{
    bShowMouseCursor = true;
    bEnableClickEvents = true;
    bEnableTouchEvents = true;
}

void ASeaOfFirePlayerController::SetupInputComponent()
{
    Super::SetupInputComponent();
    InputComponent->BindAction(TEXT("ClickMove"), IE_Pressed, this, &ASeaOfFirePlayerController::HandleClickMove);
}

void ASeaOfFirePlayerController::HandleClickMove()
{
    FHitResult Hit;
    if (!GetHitResultUnderCursor(ECC_Visibility, true, Hit))
    {
        return;
    }

    APawn* ControlledPawn = GetPawn();
    USeaOfFireMovementComponent* Movement = ControlledPawn ? ControlledPawn->FindComponentByClass<USeaOfFireMovementComponent>() : nullptr;
    if (Movement)
    {
        Movement->SetClickDestination(Hit.Location);
    }
}

