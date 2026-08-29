import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	ip: string
	password?: string // Only when upgrading from a version that had the key in config - will be moved to secrets
	remote_api: boolean
}

export interface ModuleSecrets {
	password: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'intro',
			label: 'Configuration Help',
			value: `<p>First ensure that Proclaim's "Local Server" is enabled (see <b>Settings > Remote</b>).</p>
            <p>If you are running Proclaim and Companion on different computers, you must also note the Proclaim
            computer's IP address, and set a Network Control Password in <b>Settings > Remote</b>.</p>
            <p>Then enter the IP address and password below.</p>
            <p>See the Help for this module for further details.</p>`,
			width: 12,
		},
		{
			type: 'textinput',
			id: 'ip',
			label: 'Proclaim computer IP address',
			width: 6,
			regex: Regex.IP,
			default: '127.0.0.1',
			required: true,
		},
		{
			type: 'secret-text',
			id: 'password',
			label: 'Password',
			width: 6,
			isVisibleExpression: "$(options:ip) !== '127.0.0.1'",
			required: true,
		},
		{
			type: 'checkbox',
			id: 'remote_api',
			label: 'Enable experimental Proclaim remote API',
			width: 6,
			default: false,
		},
	]
}
