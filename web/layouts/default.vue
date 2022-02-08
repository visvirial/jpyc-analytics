<template>
	<v-app>
		<v-app-bar app>
			<v-app-bar-title><NuxtLink to="/" style="color:inherit;">JPYC Analytics</NuxtLink></v-app-bar-title>
		</v-app-bar>
		<v-main>
			<v-container>
				<Nuxt />
			</v-container>
		</v-main>
		<v-footer app>
			<span>
				Copyright &copy; {{ new Date().getFullYear() }} <a href="https://twitter.com/visvirial">@visvirial</a>.
				All rights reserved.
				The author is one of the technical advisors in JPYC K.K., but this site is independent of the company.
			</span>
			<v-spacer />
			<span>[ <a href="https://github.com/visvirial/jpyc-analytics">GitHub</a> | <a href="https://jpycanalytics.docs.apiary.io/">API Docs</a> ]</span>
		</v-footer>
	</v-app>
</template>

<script>
export default {
	name: 'DefaultLayout',
}
</script>

