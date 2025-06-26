import { ItemView, Plugin, WorkspaceLeaf, Setting, Notice, Editor, MarkdownView, MarkdownEditView, IconName } from "obsidian";

import { Client, Server, Message } from 'node-osc';
import { OBSWebSocket } from 'obs-websocket-js';

export const OSC_VIEW_TYPE = "osc-view"

export class OscView extends ItemView{
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
      }

    getViewType(): string {
        return OSC_VIEW_TYPE;
    }

    getDisplayText(): string {
        return "OSC to WebSocket Settings";
    }

    getIcon(): IconName {
        return "activity";
    }
    
    async onOpen() {
       // const obs = new OBSWebSocket();
        const container = this.containerEl.children[1];

        new Notice("View Opened")	
        
        container.empty();
        // container.createDiv('Header').setText('OSC to WebSocket Commands')
        container.createEl('h1',{text:'OSC to WebSocket Commands'})
        
        new Setting(container)
        .setName('OSC to WebSocket')
        .setHeading()
        .setDisabled("newButton")
        .setDesc('refresh the view after running a "Get tags" command')
        .addButton((button) =>{
            button.setButtonText("refresh view")
            //.onClick(() => {this.addTagButtons(tagsContainer)})
        })
        
        new Setting(container)
            .setName("Connect to OBS WebSocket Server")
            //.setDesc("Enter the IP address or 'localhost'")
            .addButton((item) => {
                item
//                    containerEl.createEl('div', { attr: { id: 'my-custom-element' } });
                    .setButtonText("connect")
                    .setCta()
                    .onClick(async() => {
                        
                    this.connectToObsServer(item)
                })
            })
    }       
                // item.setValue(this.app.plugins.plugins['osc-to-websocket'].settings.websocketIP_Text).onChange(
                //     (value) => {
                //         this.app.plugins.plugins['osc-to-websocket'].settings.websocketIP_Text = value;
                //         this.app.plugins.plugins['osc-to-websocket'].settings.saveSettings()
                // })
            // });


//        const tagsContainer = container.createDiv('tags')
//
  //      this.addTagButtons(tagsContainer)
    //   }

      
	// 		const devices =[
    //     {
    //     oscName: this.settings.oscName1_Text,  
    //     oscIP: this.settings.oscIP1_Text,
    //     oscInPORT: this.settings.oscInPort1_Text,
    //     oscOutPORT: this.settings.oscOutPort1_Text,
    //   },
    //   {
    //     oscName: this.settings.oscName2_Text,  
    //     oscIP: this.settings.oscIP2_Text,
    //     oscInPORT: this.settings.oscInPort2_Text,
    //     oscOutPORT: this.settings.oscOutPort2_Text,
    //   },
    //   {
    //     oscName: this.settings.oscName3_Text,  
    //     oscIP: this.settings.oscIP3_Text,
    //     oscInPORT: this.settings.oscInPort3_Text,
    //     oscOutPORT: this.settings.oscOutPort3_Text,
    //   }
    // ]
    
//     setOSCconnection(
//       websocketIP,
//       websocketPort,
//       websocketPassword,
//       devices
//     );
    
//     async function setOSCconnection(
//       websocketIP,
//       websocketPort,
//       websocketPassword,
//       devices
//     ) {
//       /*
//       *Connect this app to OBS
//       * 
//       */
     

// /*
//  *Create an OSC Server connection
//  *OSC app -- to--> OBS
//  */

// //let oscServer = new Server(oscInPORT, oscIP);

// class OSCdevice{
//   constructor(name, oscIP, oscInPORT, oscOutPORT){
//     this.name = name;
//     this.oscIP = oscIP;
//     this.oscInPORT = oscInPORT;
//     this.oscOutPORT = oscOutPORT;
//     this.oscServer = new Server(this.oscInPORT, this.oscIP),
//     this.oscClient = new Client(this.oscIP, this.oscOutPORT),
    
//     this.oscServer.on("listening", () => {
//       //console.log("OSC Server is listening.");
//       new Notice(`OSC Server ${this.name} is listening.`);
//     });
 
//     this.oscServer.on("message", (msg) => {
//       console.log(`Message: ${msg}`);
//       sendToOBS(msg, obs, "osc-message");
//     });
//   }
// }

// const oscDevices = {};

// for(let i=0; i < devices.length; i++){
//   console.log(devices[i]);
//   if(devices[i].oscName){
//     const deviceObject = new OSCdevice(devices[i].oscName, devices[i].oscIP, devices[i].oscInPORT, devices[i].oscOutPORT);
//     oscDevices[devices[i].oscName] = deviceObject; 
//   }
// };

// console.log(oscDevices);
// console.log(oscDevices.zoomOSC.oscClient);

// function sendToOBS(msgParam, obsParam, eventName) {
//     console.log("sending message:", JSON.stringify(msgParam));
//     const webSocketMessage = JSON.stringify(msgParam);
//     //send results to OBS Browser Source
//     obsParam.call("CallVendorRequest", {
//       vendorName: "obs-browser",
//       requestType: "emit_event",
//       requestData: {
//         event_name: eventName,
//         event_data: { webSocketMessage },
//       },
//     });
//   }

//   /*
//    *Create OSC Client Out Port
//    *message from OBS --to--> OSC app
//    */

//         obs.on("CustomEvent", function (event) {
//           console.log("Message from OBS", event);
//           if (event.event_name === "OSC-out") {
//             const message = new Message(event.address);
//             if (Object.hasOwn(event, "arg1")) {
//               message.append(event.arg1);
//               console.log("arg1", message);
//             }
//             if (Object.hasOwn(event, "arg2")) {
//               message.append(event.arg2);
//               console.log("arg2",message);
//             }
//             if (Object.hasOwn(event, "arg3")) {
//               message.append(event.arg3);
//               console.log("arg3",message);
//             }
//             if (Object.hasOwn(event, "arg4")) {
//               message.append(event.arg4);
//               console.log("arg4",message);
//             }
//             if (Object.hasOwn(event, "arg5")) {
//               message.append(event.arg5);
//               console.log("arg5",message);
//             }
//             if (Object.hasOwn(event, "arg6")) {
//               message.append(event.arg6);
//               console.log("arg6",message);
//             }
//             if (Object.hasOwn(event, "arg7")) {
//               message.append(event.arg7);
//               console.log("arg7",message);
//             }
//             console.log("message to OSC device", message);
//             console.log("OSC device", oscDevices.zoomOSC.oscClient)
//             oscDevices[`zoomOSC`].oscClient.send(message, (err) => {
//               if (err) {
//                 console.error(new Error(err));
//               }
//             });
//             //client.send(`${event.command} "${event.data}"`)
//           }
//         });
//       }
    

//       addTagButtons(container){
//         container.empty()
//         const files = this.app.vault.getFolderByPath("_slide_Tags").children;
//         files.forEach(file => {
//             let tag = file.basename.split(' - ')
//             tag[0] = tag[0].toLowerCase()
//             new Setting(container)
//             .setName(file.basename)
//             .addButton((item) =>{
//             item.setButtonText("Entrance")
//                 .setCta()
//                 .onClick(() => {
//                     const lastLeaf = this.app.workspace.getMostRecentLeaf()
//                     const lastLeafWorkspace = this.app.workspace.getLeafById(lastLeaf?.id)
                    
//                     this.app.workspace.setActiveLeaf(lastLeafWorkspace,true,true);
//                     lastLeaf?.setEphemeralState(lastLeaf?.getEphemeralState())
//                     this.app.workspace.activeEditor?.editor?.replaceSelection(`<!-- slide data-${tag[0]}-entrance="${tag[1]}" -->
// `)
//                     //new Notice(`Inserted tag ${tag[1]}`)
//                     })
//                 })
//                 .addButton( item => {                
//                     item.setButtonText("Exit")
//                     .onClick(() => {
//                         const lastLeaf = this.app.workspace.getMostRecentLeaf()
//                         const lastLeafWorkspace = this.app.workspace.getLeafById(lastLeaf?.id)
//                         this.app.workspace.setActiveLeaf(lastLeafWorkspace,true,true);
//                         lastLeaf?.setEphemeralState(lastLeaf?.getEphemeralState())
//                         this.app.workspace.activeEditor?.editor?.replaceSelection(`<!-- slide data-${tag[0]}-exit="${tag[1]}" -->
// `)              
//                         //new Notice(`Inserted tag ${tag[1]}`)
//                     })
//                 })
//            });
//       }

      async onClose() {
        // Nothing to clean up.
      }
}