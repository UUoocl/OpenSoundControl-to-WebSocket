import { Notice, Plugin } from 'obsidian';
import { oscToObsSettingsTab } from 'settings';

const { Client, Server, Message } = require("node-osc")
const OBSWebSocket = require("obs-websocket-js").default;

interface oscToObsPluginSettings{
	websocketIP_Text: string;
	websocketPort_Text: string;
	websocketPW_Text: string;
	oscIP_Text: string;
	oscInPort_Text: string;
	oscOutPort_Text: string;
}

const DEFAULT_SETTINGS: Partial<oscToObsPluginSettings> = {
	websocketIP_Text: "localhost",
	websocketPort_Text: "4455",
	websocketPW_Text: "password",
	oscIP_Text: "localhost",
	oscInPort_Text: "4466",
	oscOutPort_Text: "4477"
};

export default class oscToObsPlugin extends Plugin {
	settings: oscToObsPluginSettings;

	async loadSettings(){
		this.settings = Object.assign(
			{}, 
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings(){
		this.saveData(this.settings);
	}

	async onload() {
		await this.loadSettings();
		
		this.addSettingTab(new oscToObsSettingsTab(this.app, this))

		new Notice("Enabled OSC plugin")	
		new Notice(this.settings.websocketIP_Text)	
		
		this.addRibbonIcon("activity","start OSC to Websocket", () => {
			new Notice("Starting OSC Server")
			var websocketIP = this.settings.websocketIP_Text;
			var websocketPort = this.settings.websocketPort_Text;
			var websocketPassword = this.settings.websocketPW_Text;
			var oscIP = this.settings.oscIP_Text;
			var oscInPORT = this.settings.oscInPort_Text;
			var oscOutPORT = this.settings.oscOutPort_Text;

setOSCconnection(
  websocketIP,
  websocketPort,
  websocketPassword,
  oscIP,
  oscInPORT,
  oscOutPORT
);

async function setOSCconnection(
  websocketIP,
  websocketPort,
  websocketPassword,
  oscIP,
  oscInPORT,
  oscOutPORT
) {
  
  /*
   *Connect this app to OBS
   * 
   */

  const obs = new OBSWebSocket(websocketIP, websocketPort, websocketPassword);
  try {
    const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
      `ws://${websocketIP}:${websocketPort}`,
      websocketPassword,
      {
        rpcVersion: 1,
      }
    );
    console.log(
      `Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
    );
	new Notice("Connected to OBS WebSocket Server")
    //document.title = "connection set";
  } catch (error) {
	new Notice("Failed to connect to OBS WebSocket Server")
    console.error("Failed to connect", error.code, error.message);
  }
  obs.on("error", (err) => {
    console.error("Socket error:", err);
  });
  console.log(`ws://${websocketIP}:${websocketPort}`);


/*
 *Create an OSC Server connection
 *OSC app -- to--> OBS
 */

var oscServer = new Server(oscInPORT, oscIP);

oscServer.on("listening", () => {
  console.log("OSC Server is listening.");
});

oscServer.on("message", (msg) => {
  console.log(`Message: ${msg}`);
  sendToOBS(msg, obs, "osc-message");
});

function sendToOBS(msgParam, obsParam, eventName) {
    console.log("sending message:", JSON.stringify(msgParam));
    const webSocketMessage = JSON.stringify(msgParam);
    //send results to OBS Browser Source
    obsParam.call("CallVendorRequest", {
      vendorName: "obs-browser",
      requestType: "emit_event",
      requestData: {
        event_name: eventName,
        event_data: { webSocketMessage },
      },
    });
  }

  /*
   *Create OSC Client Out Port
   *message from OBS --to--> OSC app
   */
   const oscClient = new Client(oscIP, oscOutPORT);
   console.log("oscClient", oscClient, oscIP, oscOutPORT, oscInPORT);
 
   obs.on("CustomEvent", function (event) {
     console.log("Message from OBS",event);
     if (event.event_name === "OSC-out") {
       const message = new Message(event.address);
       if (Object.hasOwn(event, "arg1")) {
         message.append(event.arg1);
         console.log("arg1", message);
       }
       if (Object.hasOwn(event, "arg2")) {
         message.append(event.arg2);
         console.log(message);
       }
       if (Object.hasOwn(event, "arg3")) {
         message.append(event.arg3);
         console.log(message);
       }
       if (Object.hasOwn(event, "arg4")) {
         message.append(event.arg4);
         console.log(message);
       }
       if (Object.hasOwn(event, "arg5")) {
         message.append(event.arg5);
         console.log(message);
       }
       if (Object.hasOwn(event, "arg6")) {
         message.append(event.arg6);
         console.log(message);
       }
       if (Object.hasOwn(event, "arg7")) {
         message.append(event.arg7);
         console.log(message);
       }
       console.log("message to OSC device", message);
       oscClient.send(message, (err) => {
         if (err) {
           console.error(new Error(err));
         }
       });
       //client.send(`${event.command} "${event.data}"`)
     }
  });
 }
			
		})


	}

	onunload() {
		new Notice("Disabled plugin")
	}
}