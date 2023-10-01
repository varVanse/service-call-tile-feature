import { LitElement, TemplateResult, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import { IConfig } from './models/interfaces';

class ServiceCallTileFeature extends LitElement {
	@property({ attribute: false })
	hass!: HomeAssistant;
	@property({ attribute: false })
	private config!: IConfig;
	@property({ attribute: false })
	private stateObj!: HassEntity;

	constructor() {
		super();
	}

	static get properties() {
		return {
			hass: {},
			config: {},
			stateObj: {},
		};
	}

	static getStubConfig() {
		return {
			type: 'custom:service-call',
			buttons: [
				{
					service: '',
					data: {},
				},
			],
		};
	}

	setConfig(config: IConfig) {
		if (!config) {
			throw new Error('Invalid configuration');
		}
		this.config = config;
	}

	_press(e: MouseEvent) {
		e.stopImmediatePropagation();
		const i = parseInt(
			(e.currentTarget as HTMLButtonElement).getAttribute('itemid') ||
				'-1',
		);
		const button = this.config.buttons[i];

		const data = JSON.parse(JSON.stringify(button.data || {}));
		if (!('entity_id' in data) || data.entity_id == '') {
			data.entity_id = this.stateObj.entity_id;
		}
		const [domain, entity] = button.service.split('.');

		this.hass.callService(domain, entity, data);
	}

	render() {
		if (!this.config || !this.hass || !this.stateObj) {
			return null;
		}

		const buttons: TemplateResult[] = [];
		for (const [i, entry] of this.config.buttons.entries()) {
			// Button color and opacity
			let color = ``;
			let opacity = ``;
			if ('color' in entry) {
				color = `background-color: ${entry.color};`;
			}
			if ('opacity' in entry) {
				opacity = `opacity: ${entry.opacity};`;
			}
			const style = `${color}${opacity}`;

			// Icon color
			let iconStyle = ``;
			if ('icon_color' in entry) {
				iconStyle = `color: ${entry.icon_color};`;
			}

			// Button label
			let label = html``;
			if ('label' in entry) {
				label = html`<div class="label">${entry.label}</div>`;
			}

			// Button, icon, and label in a container
			buttons.push(
				html`<div class="container">
					<button
						class="button"
						itemid=${i}
						@click=${this._press}
						style="${style}"
					></button>
					<ha-icon .icon=${entry.icon} style="${iconStyle}"></ha-icon>
					${label}
				</div>`,
			);
		}

		return html`<div class="row">${buttons}</div> `;
	}

	static get styles() {
		return css`
			.row {
				display: flex;
				flex-direction: row;
				flex-flow: row;
				justify-content: center;
				align-items: center;
				padding: 0 12px 12px 12px;
				width: auto;
			}
			.container {
				display: flex;
				flex-flow: column;
				place-content: center space-around;
				align-items: center;
				position: relative;
				height: 40px;
				width: 100%;
				border-radius: 10px;
				border: none;
				margin: 0 6px;
				padding: 0px;
				box-sizing: border-box;
				line-height: 0;
				outline: 0px;
				overflow: hidden;
				font-size: inherit;
				color: inherit;
			}
			.button {
				background-color: var(--disabled-color);
				opacity: 0.2;
				transition: background-color 180ms ease-in-out;
				position: absolute;
				cursor: pointer;
				height: inherit;
				width: inherit;
				border-radius: 10px;
				border: none;
			}
			@media (hover: hover) {
				.button:hover {
					opacity: 0.4;
				}
			}
			.button:active {
				opacity: 0.4;
			}

			ha-icon {
				position: relative;
				pointer-events: none;
				display: inline-flex;
				flex-flow: column;
				place-content: center;
			}

			.label {
				position: relative;
				pointer-events: none;
				display: inline-flex;
				justify-content: center;
				align-items: center;
				height: 15px;
				width: inherit;
			}
		`;
	}
}

customElements.define('service-call', ServiceCallTileFeature);

window.customTileFeatures = window.customTileFeatures || [];
window.customTileFeatures.push({
	type: 'service-call',
	name: 'Service Call',
	configurable: true,
});
