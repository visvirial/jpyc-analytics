<template>
	<span>
		<NuxtLink :to="`/addr/${chain}/${value}`">{{ short ? `${value.slice(0, 6)}..${value.slice(-4)}` : value }}</NuxtLink>
	</span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator';

@Component
export default class Address extends Vue {
	@Prop({ type: String, required: true, })
	chain!: string;
	@Prop({ type: String, required: true, })
	value!: string;
	@Prop({ type: Boolean, required: false, default: false, })
	short!: boolean;
}
</script>

