#include "SeaOfFireMovementComponent.h"

USeaOfFireMovementComponent::USeaOfFireMovementComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
}

void USeaOfFireMovementComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    if (!PawnOwner || !UpdatedComponent || ShouldSkipUpdate(DeltaTime))
    {
        return;
    }

    FVector DesiredInput = ConsumeInputVector().GetClampedToMaxSize(1.0f);
    if (DesiredInput.IsNearlyZero() && bHasClickDestination)
    {
        const FVector ToDestination = ClickDestination - UpdatedComponent->GetComponentLocation();
        if (ToDestination.Size2D() <= DestinationAcceptanceRadius)
        {
            ClearClickDestination();
        }
        else
        {
            DesiredInput = FVector(ToDestination.X, ToDestination.Y, 0.0f).GetSafeNormal();
        }
    }

    if (DesiredInput.IsNearlyZero())
    {
        return;
    }

    const FVector Delta = DesiredInput * MaxSpeed * DeltaTime;
    FHitResult Hit;
    SafeMoveUpdatedComponent(Delta, DesiredInput.Rotation(), true, Hit);

    if (Hit.IsValidBlockingHit())
    {
        SlideAlongSurface(Delta, 1.0f - Hit.Time, Hit.Normal, Hit);
    }
}

void USeaOfFireMovementComponent::SetClickDestination(const FVector& WorldDestination)
{
    ClickDestination = FVector(WorldDestination.X, WorldDestination.Y, 0.0f);
    bHasClickDestination = true;
}

void USeaOfFireMovementComponent::ClearClickDestination()
{
    bHasClickDestination = false;
}

