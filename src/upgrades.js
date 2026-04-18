export const UpgradeScripts = [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */
	function (context, _props) {
		return {
			updatedConfig: {
				ip: context.currentConfig.ip,
				// Password will be removed - moving to secrets
			},
			updatedSecrets: {
				password: context.currentConfig.password,
			},
			updatedActions: [],
			updatedFeedbacks: [],
		}
	},
]
