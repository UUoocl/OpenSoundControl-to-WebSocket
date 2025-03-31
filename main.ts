import { Notice, Plugin } from 'obsidian';
import { oscToObsSettingsTab } from 'settings';

const { Client, Server, Message } = require("node-osc")
const OBSWebSocket = require("obs-websocket-js").default;

interface oscToObsPluginSettings{
	websocketIP_Text: string;
	websocketPort_Text: string;
	websocketPW_Text: string;
	oscName1_Text: string;
	oscIP1_Text: string;
	oscInPort1_Text: string;
	oscOutPort1_Text: string;
	oscName2_Text: string;
	oscIP2_Text: string;
	oscInPort2_Text: string;
	oscOutPort2_Text: string;
}

const DEFAULT_SETTINGS: Partial<oscToObsPluginSettings> = {
	websocketIP_Text: "localhost",
	websocketPort_Text: "4455",
	websocketPW_Text: "password",
	oscIP1_Text: "localhost",
	oscInPort1_Text: "4466",
	oscOutPort1_Text: "4477"
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
			let websocketIP = this.settings.websocketIP_Text;
			let websocketPort = this.settings.websocketPort_Text;
			let websocketPassword = this.settings.websocketPW_Text;
			const devices =[
        {
        oscName: this.settings.oscName1_Text,  
        oscIP: this.settings.oscIP1_Text,
        oscInPORT: this.settings.oscInPort1_Text,
        oscOutPORT: this.settings.oscOutPort1_Text,
      },
      {
        oscName: this.settings.oscName2_Text,  
        oscIP: this.settings.oscIP2_Text,
        oscInPORT: this.settings.oscInPort2_Text,
        oscOutPORT: this.settings.oscOutPort2_Text,
      }
      ]

setOSCconnection(
  websocketIP,
  websocketPort,
  websocketPassword,
  devices
);

async function setOSCconnection(
  websocketIP,
  websocketPort,
  websocketPassword,
  devices
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
    console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
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

//let oscServer = new Server(oscInPORT, oscIP);

class OSCdevice{
  constructor(name, oscIP, oscInPORT, oscOutPORT){
    this.name = name;
    this.oscIP = oscIP;
    this.oscInPORT = oscInPORT;
    this.oscOutPORT = oscOutPORT;
    this.oscServer = new Server(this.oscInPORT, this.oscIP),
    this.oscClient = new Client(this.oscIP, this.oscOutPORT),
    
    this.oscServer.on("listening", () => {
      //console.log("OSC Server is listening.");
      new Notice("OSC Server is listening.");
    });
 
    this.oscServer.on("message", (msg) => {
      console.log(`Message: ${msg}`);
      sendToOBS(msg, obs, "osc-message");
    });
  }
}

const oscDevices = {};

for(let i=0; i < devices.length; i++){
  console.log(devices[i]);
  const deviceObject = new OSCdevice(devices[i].oscName, devices[i].oscIP, devices[i].oscInPORT, devices[i].oscOutPORT)
  oscDevices[devices[i].oscName] = deviceObject; 
};

console.log(oscDevices);
console.log(oscDevices.zoomOSC.oscClient);


  // zero:{
  //   deviceName: devices.Name1,
  //   oscServer: new Server(devices.oscInPORT1, devices.oscIP1),
  //   oscClient: new Client(devices.oscIP1, devices.oscOutPORT1),
  // },
  // one:{
  //   oscServer: new Server(devices.oscInPORT1, devices.oscIP1),
  //   oscClient: new Client(devices.oscIP1, devices.oscOutPORT1),
  // }

// oscDevices[`one`].oscServer.on("listening", () => {
//   //console.log("OSC Server is listening.");
//   new Notice("OSC Server is listening.");
// });

// oscDevices[`zero`].oscServer.on("message", (msg) => {
//   console.log(`Message: ${msg}`);
//   sendToOBS(msg, obs, "osc-message");
// });
// console.log("oscServer", oscDevices.oscServer, oscIP, oscOutPORT, oscInPORT);
// console.log("oscClient", oscDevices.oscClient, oscIP, oscOutPORT, oscInPORT);

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
       console.log("OSC device", oscDevices.zoomOSC.oscClient)
       oscDevices[`zoomOSC`].oscClient.send(message, (err) => {
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