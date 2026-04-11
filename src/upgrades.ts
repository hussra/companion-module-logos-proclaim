import type { CompanionStaticUpgradeScript, CompanionUpgradeContext, CompanionStaticUpgradeResult, CompanionStaticUpgradeProps } from '@companion-module/base'
import type { ModuleConfig, ModuleSecrets } from './config.js'

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig, ModuleSecrets>[] = [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */
	function (context: CompanionUpgradeContext<ModuleConfig>, _props: CompanionStaticUpgradeProps<ModuleConfig, ModuleSecrets>): CompanionStaticUpgradeResult<ModuleConfig, ModuleSecrets> {
		return {
			updatedConfig: {
				ip: context.currentConfig.ip,
				// Password will be removed - moving to secrets
			},
			updatedSecrets: {
				password: context.currentConfig.password?.toString() || '', // Ensure it's a string, even if it was undefined
			},
			updatedActions: [],
			updatedFeedbacks: [],
		}
	}
]
