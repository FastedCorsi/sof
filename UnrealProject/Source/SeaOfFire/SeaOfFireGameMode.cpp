#include "SeaOfFireGameMode.h"

#include "SeaOfFirePawn.h"
#include "SeaOfFirePlayerController.h"

ASeaOfFireGameMode::ASeaOfFireGameMode()
{
    DefaultPawnClass = ASeaOfFirePawn::StaticClass();
    PlayerControllerClass = ASeaOfFirePlayerController::StaticClass();
}

