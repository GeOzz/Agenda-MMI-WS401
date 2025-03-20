// uno.config.ts
import {
	defineConfig,
	presetUno,
	presetMini,
	transformerDirectives,
	presetTypography
} from 'unocss';
import presetIcons from '@unocss/preset-icons';

import transformerVariantGroup from '@unocss/transformer-variant-group';
import { presetForms } from '@julr/unocss-preset-forms';

export default defineConfig({
	transformers: [transformerVariantGroup(), transformerDirectives()],
	presets: [
		presetUno(),
		presetIcons(),
		presetMini({
			dark: 'media'
		}),
		presetForms(),
		presetTypography()
		// ...other presets
	]
});
