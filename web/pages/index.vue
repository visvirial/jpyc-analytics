<template>
	<v-row justify="center" align="center">
		<v-col cols="12">
			
			<v-parallax height="600" :src="require('~/assets/img/sauna.jpg')">
				<v-row align="center">
					<v-col class="text-center">
						<h1>JPYC Analytics</h1>
						<p>JPYC is the most issued &amp; traded stable coin pegged to JPY</p>
					</v-col>
				</v-row>
			</v-parallax>
			
			<h2>Market Circulation Statistics</h2>
			
			<div class="text-center" style="font-size: 200%;">
				<div>
					<span style="font-size: 200%;">
						<AnimatedNumber :value="Number.parseFloat(total_transfers.value)"></AnimatedNumber>
						<span style="font-size: 80%;">JPYC</span>
					</span>
					transfered in 24h.
				</div>
				<div>
					<span style="font-size: 200%;">
						<AnimatedNumber :value="total_transfers.count"></AnimatedNumber>
					</span>
					transactions submited in 24h.
				</div>
			</div>
			
			<h2>Recent Transactions</h2>
			
			<Transactions :value="txs" />
			
		</v-col>
	</v-row>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator';

@Component({
	name: 'IndexPage',
})
export default class Index extends Vue {
	total_transfers = {
		value: 0,
		count: 0,
	};
	txs = [];
	async mounted() {
		const now = Math.floor(Date.now() / 1000);
		(async () => { this.total_transfers = (await this.$axios.$get(`total_transfers?after=${now - 24 * 60 * 60}`)); })();
		(async () => { this.txs = (await this.$axios.$get('txs')).txs; })();
	}
}
</script>
