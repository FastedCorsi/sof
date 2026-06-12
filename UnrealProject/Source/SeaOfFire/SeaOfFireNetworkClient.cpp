#include "SeaOfFireNetworkClient.h"

USeaOfFireNetworkClient::USeaOfFireNetworkClient()
{
    PrimaryComponentTick.bCanEverTick = false;
}

void USeaOfFireNetworkClient::SetLastServerMessage(const FString& Message)
{
    LastServerMessage = Message;
    SnapshotAgeSeconds = 0.0f;
}

