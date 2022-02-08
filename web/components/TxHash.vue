<template>
	<span>
		<a :href="this.url()">{{ short ? `${value.slice(0, 4)}..${value.slice(-4)}` : value }}</a>
	</span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator';

@Component
export default class TxHash extends Vue {
	@Prop({ type: String, required: true, })
	chain: string!;
	@Prop({ type: String, required: true, })
	value: string!;
	@Prop({ type: Boolean, required: false, default: false, })
	short: boolean!;
	url() {
		const urlPrefixes = {
			eth    : 'https://etherscan.io/tx/',
			polygon: 'https://polygonscan.io/tx/',
			xdai   : 'https://blockscout.com/shiden/tx/',
			shiden : 'https://shiden.subscan.io/tx/',
		};
		if(urlPrefixes[this.chain]) {
			return (urlPrefixes[this.chain] + this.value);
		} else {
			return null;
		}
	}
}
</script>

