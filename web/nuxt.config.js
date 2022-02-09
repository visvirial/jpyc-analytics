
import colors from 'vuetify/es5/util/colors'

export default {
	
	// Target: https://go.nuxtjs.dev/config-target
	target: 'server',
	
	// Global page headers: https://go.nuxtjs.dev/config-head
	head: {
		titleTemplate: '%s - JPYC Analytics',
		title: 'JPYC Analytics',
		htmlAttrs: {
			lang: 'en'
		},
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ hid: 'description', name: 'description', content: '' },
			{ name: 'format-detection', content: 'telephone=no' }
		],
		link: [
			{ rel: 'icon', type: 'image/png', href: '/favicon.png' }
		]
	},
	
	// Global CSS: https://go.nuxtjs.dev/config-css
	css: [
	],
	
	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [
	],
	
	// Auto import components: https://go.nuxtjs.dev/config-components
	components: true,
	
	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [
		// https://go.nuxtjs.dev/typescript
		'@nuxt/typescript-build',
		// https://go.nuxtjs.dev/vuetify
		'@nuxtjs/vuetify'
	],
	
	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [
		// https://go.nuxtjs.dev/axios
		'@nuxtjs/axios',
		[
			'@nuxtjs/google-gtag',
			{
				id: 'G-GXWYTLG83W',
			},
		],
	],
	
	// Axios module configuration: https://go.nuxtjs.dev/config-axios
	axios: {
		// Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
		baseURL: '/'
	},
	
	// Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
	vuetify: {
		customVariables: ['~/assets/variables.scss'],
	},
	
	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {
	},
	
	server: {
		port: 3000,
		host: '0.0.0.0',
	},
	
};

