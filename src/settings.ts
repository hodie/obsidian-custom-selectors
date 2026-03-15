import { App, PluginSettingTab, Setting } from "obsidian";
import CustomSelectorsPlugin from "./main";

export interface SelectorConfig {
	name: string;
	options: string[];
	defaultFirst: boolean;
}

export interface CustomSelectorsSettings {
	selectors: SelectorConfig[];
}

export const DEFAULT_SETTINGS: CustomSelectorsSettings = {
	selectors: []
};

export class CustomSelectorsSettingTab extends PluginSettingTab {
	plugin: CustomSelectorsPlugin;

	constructor(app: App, plugin: CustomSelectorsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Custom selectors")
			.setDesc("Define properties that display as dropdown menus in the Properties view and Bases tables.")
			.setHeading();

		this.plugin.settings.selectors.forEach((selector, index) => {
			const section = containerEl.createDiv({ cls: 'cs-selector-section' });
			const shortName = selector.name.replace(/^selector\./, '');

			new Setting(section)
				.setName(shortName || "New selector")
				.setHeading()
				.addExtraButton(btn => btn
					.setIcon("trash")
					.setTooltip("Delete this selector")
					.onClick(async () => {
						this.plugin.settings.selectors.splice(index, 1);
						await this.plugin.saveSettings();
						this.display();
					})
				);

			new Setting(section)
				.setName("Name")
				.setDesc("Stored as selector.<name> in frontmatter.")
				.addText(text => text
					.setPlaceholder("e.g. status")
					.setValue(shortName)
					.onChange(async (value) => {
						selector.name = `selector.${value}`;
						await this.plugin.saveSettings();
					})
				);

			new Setting(section)
				.setName("Options")
				.setDesc("Comma-separated list of dropdown values.")
				.addText(text => text
					.setPlaceholder("e.g. To-Do, Doing, Done")
					.setValue(selector.options.join(", "))
					.onChange(async (value) => {
						selector.options = value.split(",").map(s => s.trim()).filter(s => s.length > 0);
						await this.plugin.saveSettings();
					})
				);

			new Setting(section)
				.setName("Default to first option")
				.setDesc("When creating a new file from a Bases view that includes this property as a column, set the first option as the default value.")
				.addToggle(toggle => toggle
					.setValue(selector.defaultFirst ?? false)
					.onChange(async (value) => {
						selector.defaultFirst = value;
						await this.plugin.saveSettings();
					})
				);
		});

		new Setting(containerEl)
			.addButton(btn => btn
				.setButtonText("Add selector")
				.onClick(async () => {
					this.plugin.settings.selectors.push({ name: "selector.", options: [], defaultFirst: false });
					await this.plugin.saveSettings();
					this.display();
				})
			);
	}
}
