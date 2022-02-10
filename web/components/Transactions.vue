<template>
	<v-data-table :headers="txsHeaders" :items="value">
		<template v-slot:item.chain="{ item }">
			<ChainName :value="item.chain" />
		</template>
		<template v-slot:item.height="{ item }">
			<BlockNumber :chain="item.chain" :value="item.height" />
		</template>
		<template v-slot:item.timestamp="{ item }">
			<TimeStamp :value="item.timestamp" />
		</template>
		<template v-slot:item.txhash="{ item }">
			<TxHash :chain="item.chain" :value="item.txhash" short />
		</template>
		<template v-slot:item.from="{ item }">
			<Address :chain="item.chain" :value="item.from" short />
		</template>
		<template v-slot:item.to="{ item }">
			<Address :chain="item.chain" :value="item.to" short />
		</template>
		<template v-slot:item.value="{ item }">
			<Amount :value="Number.parseFloat(item.value)" />
		</template>
	</v-data-table>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator';

@Component
export default class Transactions extends Vue {
	@Prop({ type: Array, required: true, })
	value!;
	txsHeaders = [
		{
			text: 'Blockchain',
			value: 'chain',
		},
		{
			text: 'Block Number',
			value: 'height',
		},
		{
			text: 'Timestamp',
			value: 'timestamp',
		},
		{
			text: 'Transaction Hash',
			value: 'txhash',
		},
		{
			text: 'From',
			value: 'from',
		},
		{
			text: 'To',
			value: 'to',
		},
		{
			text: 'Amount Transacted',
			value: 'value',
			align: 'right',
		},
	];
}
</script>

