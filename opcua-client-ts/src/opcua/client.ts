import {
  OPCUAClient,
  MessageSecurityMode,
  SecurityPolicy,
  AttributeIds,
  ClientSubscription,
  ClientMonitoredItem,
  TimestampsToReturn
} from "node-opcua";

export async function startOPCUASubscription(
  onData: (data: any) => void
) {
  const endpointUrl = "opc.tcp://127.0.0.1:4840";

  const client = OPCUAClient.create({
    applicationName: "SPBU-OPCUA-Client",
    securityMode: MessageSecurityMode.None,
    securityPolicy: SecurityPolicy.None,
    endpointMustExist: false
  });

  console.log("🔌 Connecting OPC UA...");
  await client.connect(endpointUrl);

  const session = await client.createSession();
  console.log("✅ OPC UA Session created");

  const subscription = ClientSubscription.create(session, {
    requestedPublishingInterval: 1000, // 1 detik
    requestedLifetimeCount: 100,
    requestedMaxKeepAliveCount: 10,
    maxNotificationsPerPublish: 100,
    publishingEnabled: true,
    priority: 1
  });

  subscription.on("started", () => {
    console.log("📡 OPC UA Subscription started");
  });

  subscription.on("terminated", () => {
    console.log("❌ OPC UA Subscription terminated");
  });

  // 🔧 CONTOH TAG PLC FX3U (ganti sesuai MX OPC Server)
  const nodesToMonitor = [
    { name: "LEVEL_TANK_1", nodeId: "ns=2;s=FX3U.D100" },
    { name: "FLOW_RATE", nodeId: "ns=2;s=FX3U.D200" },
    { name: "PUMP_STATUS", nodeId: "ns=2;s=FX3U.M0" }
  ];

  nodesToMonitor.forEach((tag) => {
    const itemToMonitor = {
      nodeId: tag.nodeId,
      attributeId: AttributeIds.Value
    };

    const parameters = {
      samplingInterval: 1000,
      discardOldest: true,
      queueSize: 10
    };

    const monitoredItem = ClientMonitoredItem.create(
      subscription,
      itemToMonitor,
      parameters,
      TimestampsToReturn.Both
    );

    monitoredItem.on("changed", (dataValue) => {
      onData({
        tag: tag.name,
        value: dataValue.value.value,
        timestamp: dataValue.serverTimestamp
      });
    });
  });
}
