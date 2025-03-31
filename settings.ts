import oscToObsPlugin from "main";
import {App, PluginSettingTab, Setting } from "obsidian";

export class oscToObsSettingsTab extends PluginSettingTab {
    plugin: oscToObsPlugin;

    constructor(app: App, plugin: oscToObsPlugin){
        super(app,plugin);
        this.plugin = plugin;
    }

    display(){
        let { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
        .setName("OBS WebSocket Server Settings")
        .setHeading()
        .setDesc("Copy the Websocket Server Settings from OBS")
        
        new Setting(containerEl)
        .setName("OBS WebSocket Server IP")
        .setDesc("Enter the IP address or 'localhost'")
        .addText((item) => {
            item.setValue(this.plugin.settings.websocketIP_Text).onChange(
                (value) => {
                    this.plugin.settings.websocketIP_Text = value;
                    this.plugin.saveSettings()
             })
        });

        new Setting(containerEl)
        .setName("OBS WebSocket Server PORT")
        .addText((item) => {
            item.setValue(this.plugin.settings.websocketPort_Text).onChange(
                (value) => {
                    this.plugin.settings.websocketPort_Text = value;
                    this.plugin.saveSettings()
             })
        });

        new Setting(containerEl)
        .setName("OBS WebSocket Server Password")
        .addText((item) => {
            item.setValue(this.plugin.settings.websocketPW_Text).onChange(
                (value) => {
                    this.plugin.settings.websocketPW_Text = value;
                    this.plugin.saveSettings()
             })
        });


//		 
//	#region OSC Device 1
//
        new Setting(containerEl)
        .setName("OSC Device 1 Settings")
        .setHeading()

        new Setting(containerEl)
        .setName("OSC Device Name")
        .setDesc("Unique device name")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscName1_Text).onChange(
                (value) => {
                    this.plugin.settings.oscName1_Text = value;
                    this.plugin.saveSettings()
             })
        });

        new Setting(containerEl)
        .setName("OSC IP address")
        .setDesc("Enter the IP address or 'localhost'")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscIP1_Text).onChange(
                (value) => {
                    this.plugin.settings.oscIP1_Text = value;
                    this.plugin.saveSettings()
             })
        });

        new Setting(containerEl)
        .setName("OSC Incoming Message PORT")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscInPort1_Text).onChange(
                (value) => {
                    this.plugin.settings.oscInPort1_Text = value;
                    this.plugin.saveSettings()
             })
        });

        new Setting(containerEl)
        .setName("OSC Out going Message PORT")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscOutPort1_Text).onChange(
                (value) => {
                    this.plugin.settings.oscOutPort1_Text = value;
                    this.plugin.saveSettings()
             })
        });
// #endregion

//		 
//	#region OSC Device 2
//
        new Setting(containerEl)
        .setName("OSC Device 2 Settings")
        .setHeading()

        new Setting(containerEl)
        .setName("OSC Device Name")
        .setDesc("Unique device name")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscName2_Text).onChange(
                (value) => {
                    this.plugin.settings.oscName2_Text = value;
                    this.plugin.saveSettings()
             })
        });

        new Setting(containerEl)
        .setName("OSC IP address")
        .setDesc("Enter the IP address or 'localhost'")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscIP2_Text).onChange(
                (value) => {
                    this.plugin.settings.oscIP2_Text = value;
                    this.plugin.saveSettings()
             })
        });

        new Setting(containerEl)
        .setName("OSC Incoming Message PORT")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscInPort2_Text).onChange(
                (value) => {
                    this.plugin.settings.oscInPort2_Text = value;
                    this.plugin.saveSettings()
             })
        });

        new Setting(containerEl)
        .setName("OSC Out going Message PORT")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscOutPort2_Text).onChange(
                (value) => {
                    this.plugin.settings.oscOutPort2_Text = value;
                    this.plugin.saveSettings()
             })
        });
// #endregion
    
    }

}
