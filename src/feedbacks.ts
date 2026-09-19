import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export const UpdateFeedbacks = function (self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		on_air: {
			name: 'On Air',
			type: 'boolean',
			description: 'Whether or not Proclaim is On Air',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.proclaimAPI.status.onAir
			},
		},

		in_service_part: {
			name: 'In Service Part',
			type: 'boolean',
			description: 'Whether or not Proclaim is in a particular service part',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'servicePart',
					type: 'dropdown',
					label: 'Service Part',
					default: 'service',
					choices: [
						{ id: 'pre-service', label: 'Pre-Service' },
						{ id: 'warmup', label: 'Warmup' },
						{ id: 'service', label: 'Service' },
						{ id: 'post-service', label: 'Post-Service' },
					],
				},
			],
			callback: (event) => {
				const servicePart = event.options.servicePart
				const itemIndex = self.proclaimAPI.status.currentItemIndex
				const warmupStartIndex = self.proclaimAPI.status.presentation?.warmupStartIndex ?? -1
				const serviceStartIndex = self.proclaimAPI.status.presentation?.serviceStartIndex ?? -1
				const postServiceStartIndex = self.proclaimAPI.status.presentation?.postServiceStartIndex ?? -1
				if (servicePart === 'pre-service') {
					return self.proclaimAPI.status.onAir && itemIndex < warmupStartIndex
				} else if (servicePart === 'warmup') {
					return self.proclaimAPI.status.onAir && itemIndex >= warmupStartIndex && itemIndex < serviceStartIndex
				} else if (servicePart === 'service') {
					return self.proclaimAPI.status.onAir && itemIndex >= serviceStartIndex && itemIndex < postServiceStartIndex
				} else if (servicePart === 'post-service') {
					return self.proclaimAPI.status.onAir && itemIndex >= postServiceStartIndex
				}
				return true
			},
		},
	})
}
