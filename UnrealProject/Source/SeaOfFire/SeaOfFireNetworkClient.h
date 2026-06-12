#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "SeaOfFireNetworkClient.generated.h"

UCLASS(ClassGroup=(SeaOfFire), meta=(BlueprintSpawnableComponent))
class SEAOFFIRE_API USeaOfFireNetworkClient : public UActorComponent
{
    GENERATED_BODY()

public:
    USeaOfFireNetworkClient();

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Sea of Fire|Network")
    FString WebSocketUrl = TEXT("ws://51.38.35.62:8080/ws");

    UPROPERTY(BlueprintReadOnly, Category="Sea of Fire|Network")
    FString LastServerMessage;

    UPROPERTY(BlueprintReadOnly, Category="Sea of Fire|Network")
    float SnapshotAgeSeconds = 0.0f;

    UFUNCTION(BlueprintCallable, Category="Sea of Fire|Network")
    void SetLastServerMessage(const FString& Message);
};

