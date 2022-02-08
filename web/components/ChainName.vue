<template>
	<span>
		<template v-if="value == 'eth'">Ethereum</template>
		<template v-else-if="value == 'polygon'">Polygon</template>
		<template v-else-if="value == 'xdai'">xDai</template>
		<template v-else-if="value == 'shiden'">Shiden</template>
		<template v-else>Unknown Chain ({{ value }})</template>
	</span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator';

@Component
export default class ChainName extends Vue {
	@Prop({ type: String, required: true, })
	value: string!;
}
</script>

