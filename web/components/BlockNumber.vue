<template>
	<span>
		<a v-if="chain == 'eth'" :href="`https://etherscan.io/block/${value}`">{{ value.toLocaleString() }}</a>
		<a v-else-if="chain == 'polygon'" :href="`https://polygonscan.com/block/${value}`">{{ value.toLocaleString() }}</a>
		<a v-else-if="chain == 'xdai'" :href="`https://blockscout.com/shiden/block/${value}`">{{ value.toLocaleString() }}</a>
		<a v-else-if="chain == 'shiden'" :href="`https://shiden.subscan.io/block/${value}`">{{ value.toLocaleString() }}</a>
		<span v-else>{{ value.toLocaleString() }}</span>
	</span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator';

@Component
export default class BlockNumber extends Vue {
	@Prop({ type: String, required: true, })
	chain!: string;
	@Prop({ type: Number, required: true, })
	value!: number;
}
</script>

