import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { ServicePart } from './apiTypes.js'

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
					choices: Object.keys(ServicePart).map((key) => {
						return { id: key, label: ServicePart[key as keyof typeof ServicePart] }
					}),
				},
			],
			callback: (event) => {
				const servicePart = ServicePart[event.options.servicePart as keyof typeof ServicePart]

				const itemIndex = self.proclaimAPI.status.currentItemIndex
				const warmupStartIndex = self.proclaimAPI.status.presentation?.warmupStartIndex ?? -1
				const serviceStartIndex = self.proclaimAPI.status.presentation?.serviceStartIndex ?? -1
				const postServiceStartIndex = self.proclaimAPI.status.presentation?.postServiceStartIndex ?? -1

				// Bail if we haven't yet got the presentation data - prevents brief flash of wrong feedback when
				// module first connecting
				if (self.proclaimAPI.status.presentation == undefined) {
					return false
				}

				switch (servicePart) {
					case ServicePart.PRE_SERVICE:
						return self.proclaimAPI.status.onAir && itemIndex < warmupStartIndex
					case ServicePart.WARMUP:
						return self.proclaimAPI.status.onAir && itemIndex >= warmupStartIndex && itemIndex < serviceStartIndex
					case ServicePart.SERVICE:
						return self.proclaimAPI.status.onAir && itemIndex >= serviceStartIndex && itemIndex < postServiceStartIndex
					case ServicePart.POST_SERVICE:
						return self.proclaimAPI.status.onAir && itemIndex >= postServiceStartIndex
					default:
						return false
				}
			},
		},
	})
}
