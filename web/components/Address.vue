<template>
	<span>
		<a :href="this.url()">{{ short ? `${value.slice(0, 6)}..${value.slice(-4)}` : value }}</a>
	</span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator';

@Component
export default class Address extends Vue {
	@Prop({ type: String, required: true, })
	chain: string!;
	@Prop({ type: String, required: true, })
	value: string!;
	@Prop({ type: Boolean, required: false, default: false, })
	short: boolean!;
	url() {
		const urlPrefixes = {
			eth    : 'https://etherscan.io/address/',
			polygon: 'https://polygonscan.io/address/',
			xdai   : 'https://blockscout.com/shiden/address/',
			shiden : 'https://shiden.subscan.io/account/',
		};
		if(urlPrefixes[this.chain]) {
			return (urlPrefixes[this.chain] + this.value);
		} else {
			return null;
		}
	}
}
</script>

