#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "SeaOfFirePlayerController.generated.h"

UCLASS()
class SEAOFFIRE_API ASeaOfFirePlayerController : public APlayerController
{
    GENERATED_BODY()

public:
    ASeaOfFirePlayerController();

    virtual void SetupInputComponent() override;

private:
    void HandleClickMove();
};

