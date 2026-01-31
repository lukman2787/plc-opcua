import {
  ClientSubscription,
  ClientMonitoredItem,
  AttributeIds,
  TimestampsToReturn,
  ClientSession
} from "node-opcua";

export function subscribeTag(
  session: ClientSession,
  nodeId: string,
  onChange: (value: any) => void
) {
  const subscription = ClientSubscription.create(session, {
    requestedPublishingInterval: 500
  });

  const item = ClientMonitoredItem.create(
    subscription,
    { nodeId, attributeId: AttributeIds.Value },
    { samplingInterval: 500 },
    TimestampsToReturn.Both
  );

  item.on("changed", (dataValue) => {
    onChange(dataValue.value.value);
  });
}
