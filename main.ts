import { Notice, Plugin, Platform,WorkspaceLeaf  } from 'obsidian';
import { oscToWebSocketSettingsTab } from 'settings';
import { OSC_VIEW_TYPE, OscView } from 'view';

import { execSync } from 'node:child_process';
import path from 'node:path'; 
import util from 'util';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec); 

import { Client, Server, Message } from 'node-osc';
import { OBSWebSocket } from 'obs-websocket-js';

interface oscToWebSocketPluginSettings{
	websocketIP_Text: string;
	websocketPort_Text: string;
	websocketPW_Text: string;
	obsDebugPort_Text: string;
	oscName1_Text: string;
	oscIP1_Text: string;
	oscInPort1_Text: string;
	oscOutPort1_Text: string;
	oscName2_Text: string;
	oscIP2_Text: string;
	oscInPort2_Text: string;
	oscOutPort2_Text: string;
	oscName3_Text: string;
	oscIP3_Text: string;
	oscInPort3_Text: string;
	oscOutPort3_Text: string;
}

const DEFAULT_SETTINGS: Partial<oscToWebSocketPluginSettings> = {
	websocketIP_Text: "localhost",
	websocketPort_Text: "4455",
	websocketPW_Text: "password",
	obsDebugPort_Text: "9222",
	oscIP1_Text: "localhost",
	oscInPort1_Text: "4466",
	oscOutPort1_Text: "4477"
};

export default class oscToWebSocketPlugin extends Plugin {
	settings: oscToWebSocketPluginSettings;

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
	
		this.registerView(OSC_VIEW_TYPE, (leaf) => new OscView(leaf))

		this.addRibbonIcon("activity","start OSC to Websocket", () => {
      this.openView();
    })

    this.addSettingTab(new oscToWebSocketSettingsTab(this.app, this))

		new Notice("Enabled OSC-to-WebSocket plugin")	
		new Notice(this.settings.websocketIP_Text)	
		
    let obs = this.app.plugins.plugins['osc-to-websocket'].settings.obs;
	let oscClient1 = {}, oscClient2 = {};
    this.app.plugins.plugins['osc-to-websocket'].settings.oscDevices = {};

	obs = new OBSWebSocket();

	// class OSCdevice {
	// 			constructor(name, oscIP, oscInPORT, oscOutPORT) {
	// 				this.name = name;
	// 				this.oscIP = oscIP;
	// 				this.oscInPORT = oscInPORT;
	// 				this.oscOutPORT = oscOutPORT;
	// 				//this.oscServer = new Server(this.oscInPORT, this.oscIP),
	// 				//this.oscClient = new Client(this.oscIP, this.oscOutPORT),

	// 				this.oscServer.on("listening", () => {
	// 					//console.log("OSC Server is listening.");
	// 					new Notice(`OSC Server ${this.name} is listening.`);
	// 				});

	// 				this.oscServer.on("message", (msg) => {
	// 					console.log(`Message: ${msg}`);
	// 					sendToOBS(msg, "osc-message");
	// 				});
	// 			}
	// 		}


	//
	// #region Connect to OBS Websocket connection
	//
    this.addCommand({
		id: 'connect-to-obs-websocket',
		name: 'Connect to OBS Websocket connection',
		callback: () => {
			new Notice("Starting OBS Web Socket Server Connection")
			
			const wssDetails = {
				IP: this.app.plugins.plugins['osc-to-websocket'].settings.websocketIP_Text,
				PORT: this.app.plugins.plugins['osc-to-websocket'].settings.websocketPort_Text,
				PW: this.app.plugins.plugins['osc-to-websocket'].settings.websocketPW_Text
			}
			obsWSSconnect(wssDetails)
		}
	})

	async function obsWSSconnect(wssDetails){
		try {
                //avoid duplicate connections
                await disconnect()
                const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
                    `ws://${wssDetails.IP}:${wssDetails.PORT}`,
                    wssDetails.PW,
                    {
                        rpcVersion: 1,
                    }
                )
                console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
                new Notice("Connected to OBS WebSocket Server");
                // item.setButtonText('disconnect');
                // item.removeCta
            } catch (error) {
                new Notice("Failed to connect to OBS WebSocket Server")
                console.error("Failed to connect", error.code, error.message);
            }
	}
        
        async function disconnect () {
          try{
            await obs.disconnect()
            console.log("disconnected")
            obs.connected = false
          } catch(error){
            console.error("disconnect catch",error)
          } 
        }
        
        obs.on('ConnectionOpened', () => {
          console.log('Connection to OBS WebSocket successfully opened');
          obs.status = "connected";
        });
        
        obs.on('ConnectionClosed', () => {
          console.log('Connection to OBS WebSocket closed');
          obs.status = "disconnected";
        });
        
        obs.on('ConnectionError', err => {
          console.error('Connection to OBS WebSocket failed', err);
        });
        
        obs.on("Identified", async (data) => {
			obs.connected = true;
			console.log("OBS WebSocket successfully identified", data);

			const wssDetails = {
				IP: this.app.plugins.plugins['osc-to-websocket'].settings.websocketIP_Text,
				PORT: this.app.plugins.plugins['osc-to-websocket'].settings.websocketPort_Text,
				PW: this.app.plugins.plugins['osc-to-websocket'].settings.websocketPW_Text
			}

			await obs.call("CallVendorRequest", {
                vendorName: "obs-browser",
                requestType: "emit_event",
                requestData: {
                    event_name: "ws-details",
                    event_data: { wssDetails },
                },
            });
			console.log(`ws://${wssDetails.IP}:${wssDetails.PORT}`);  
			
        });
        
        obs.on("error", (err) => {
          console.error("Socket error:", err);
        });

		obs.on("CustomEvent", function (event) {
			console.log("Message from OBS",event);
			console.log(`looking for OSC - out`)
			if (event.event_name === `OSC-out`) {
				const message = new Message(event.address);
				if (Object.hasOwn(event, "arg1")) {
					message.append(event.arg1);
					//console.log("arg1", message);
				}
				if (Object.hasOwn(event, "arg2")) {
					message.append(event.arg2);
					//console.log(message);
				}
				if (Object.hasOwn(event, "arg3")) {
					message.append(event.arg3);
					//console.log(message);
				}
				if (Object.hasOwn(event, "arg4")) {
					message.append(event.arg4);
					//console.log(message);
				}
				if (Object.hasOwn(event, "arg5")) {
					message.append(event.arg5);
					//console.log(message);
				}
				if (Object.hasOwn(event, "arg6")) {
					message.append(event.arg6);
					//console.log(message);
				}
				if (Object.hasOwn(event, "arg7")) {
					message.append(event.arg7);
					//console.log(message);
				}
				console.log(`message to OSC device - ${event.osc_name}`, message);
				
				switch(event.osc_name){
					case oscClient1.oscName:
						console.log("1")
						oscClient1.oscClient.send(message, (err) => {
							if (err) {
								console.error(new Error(err));
							}
						});
						break;
					case oscClient2.oscName:
						console.log("2")
						oscClient2.oscClient.send(message, (err) => {
							if (err) {
								console.error(new Error(err));
							}
						});
						break;
				}
			

				//messageToOscClient(message)

				//this.app.plugins.plugins['osc-to-websocket'].settings.oscDevices.zoomOSC.oscClient.send(message)
				//console.log("oscclient",oscClientTemp)
				// oscClientTemp.send(message, (err) => {
				// 		if (err) {
				// 			console.error(new Error(err));
				// 		}
				// 	});
				//client.send(`${event.command} "${event.data}"`)
			}
		});		

	function sendToOBS(msgParam, eventName) {
		//console.log("sending message:", JSON.stringify(msgParam));
		const webSocketMessage = JSON.stringify(msgParam);
		//send results to OBS Browser Source
		obs.call("CallVendorRequest", {
			vendorName: "obs-browser",
			requestType: "emit_event",
			requestData: {
				event_name: eventName,
				event_data: { 
					webSocketMessage 
				},
			},
		});
	}
	// #endregion

	//
	// #region Connect to OCS device 1 
	//

	this.addCommand({
		id: 'connect-to-osc-1',
		name: 'Connect to OCS device 1',
		callback: async () => {
			new Notice("Starting OSC Server");
			let oscName = this.app.plugins.plugins['osc-to-websocket'].settings.oscName1_Text; 
			let oscIP = this.app.plugins.plugins['osc-to-websocket'].settings.oscIP1_Text;
			let oscInPORT = this.app.plugins.plugins['osc-to-websocket'].settings.oscInPort1_Text;
			let oscOutPORT = this.app.plugins.plugins['osc-to-websocket'].settings.oscOutPort1_Text;
			oscClient1.oscClient = new Client(oscIP, oscOutPORT);
			oscClient1.oscName = oscName;

			/*
			*Create an OSC Server connection
			*OSC app -- to--> OBS
			*/
			
			const oscServer1 = new Server(oscInPORT, oscIP);
			
			oscServer1.on("listening", () => {
				//console.log("OSC Server is listening.");
				new Notice(`OSC Server ${oscName} is listening.`);
			});
			
			oscServer1.on("message", (msg) => {
				console.log(`Message 1: ${msg}`);
				sendToOBS(msg, "osc-message");
			});
		}
	})
	
	// #endregion
	
	//
	// #region Connect to OCS device 2 
	//

	this.addCommand({
		id: 'connect-to-osc-2',
		name: 'Connect to OCS device 2',
		callback: async () => {
			new Notice("Starting OSC Server 2");
			let oscName = this.app.plugins.plugins['osc-to-websocket'].settings.oscName2_Text; 
			let oscIP = this.app.plugins.plugins['osc-to-websocket'].settings.oscIP2_Text;
			let oscInPORT = this.app.plugins.plugins['osc-to-websocket'].settings.oscInPort2_Text;
			let oscOutPORT = this.app.plugins.plugins['osc-to-websocket'].settings.oscOutPort2_Text;
			oscClient2.oscClient = new Client(oscIP, oscOutPORT);
			oscClient2.oscName = oscName;

			/*
			*Create an OSC Server connection
			*OSC app -- to--> OBS
			*/
			
			const oscServer2 = new Server(oscInPORT, oscIP);
			
			oscServer2.on("listening", () => {
				//console.log("OSC Server is listening.");
				new Notice(`OSC Server ${oscName} is listening.`);
			});
			
			oscServer2.on("message", (msg) => {
				console.log(`Message 2: ${msg}`);
				sendToOBS(msg, "osc-message");
			});
		}
	})
	// function messageToOscClient(message){
	// 	console.log("messgae send function", message)
	// 	oscClient1.send(message);
	// }

	// #endregion

//		
// #region Open OBS feature
// 
//
//	Execute a command line to Open OBS

		this.addCommand({
			id: 'open-obs',
			name: 'Open OBS',
			callback: async () => {
				//build command string
				
				let commandString ="hello"
				if (Platform.isMacOS) {
					commandString = `open -n -a "${this.settings.obsAppName_Text}"`;
					commandString += ` --args --collection "${this.settings.obsCollection_Text}"`;
					commandString += ` --remote-debugging-port=${this.settings.obsDebugPort_Text}`;
					commandString += ` --remote-allow-origins=http://localhost:${this.settings.obsDebugPort_Text}`;
					commandString += ` --websocket_port "${this.settings.websocketPort_Text}"`;
					commandString += ` --websocket_password "${this.settings.websocketPW_Text}"`;
					commandString += ` --multi`;
					execAsync(commandString);
				}
				if (Platform.isWin) {
					const obsPath = `${this.settings.obsAppPath_Text}${this.settings.obsAppName_Text}`
					const obsDir = path.dirname(obsPath);
					process.chdir(obsDir)
		
					commandString = `${this.settings.obsAppName_Text}`;
					commandString += ` --args --collection "${this.settings.obsCollection_Text}"`;
					commandString += ` --remote-debugging-port=${this.settings.obsDebugPort_Text}`;
					commandString += ` --remote-allow-origins=http://localhost:${this.settings.obsDebugPort_Text}`;
					commandString += ` --websocket_port "${this.settings.websocketPort_Text}"`;
					commandString += ` --websocket_password "${this.settings.websocketPW_Text}"`;
					commandString += ` --multi`;
		
					execAsync(commandString, (error, stdout, stderr) => {
					  if (error) {
						  //console.error(`execAsync error: ${error}`);
						  return;
					  }
					  //console.log(`stdout: ${stdout}`);
					  //console.error(`stderr: ${stderr}`);
					});
				  }
				//console.log(commandString)

				}
			}
		)

// #endregion
  }

async openView(){
	const { workspace } = this.app;
	let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(OSC_VIEW_TYPE);

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0];
	
    } else {
      // Our view could not be found in the workspace, create a new leaf
      // in the right sidebar for it
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: OSC_VIEW_TYPE, active: true });
    }

    // "Reveal" the leaf in case it is in a collapsed sidebar
    workspace.revealLeaf(leaf);
  }

	onunload() {
		new Notice("Disabled OSC to WebSocket plugin")
	}

}