<template>
	<span>
		{{ formattedValue }}
	</span>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator';
import gsap from 'gsap';

@Component
export default class Amount extends Vue {
	@Prop({ type: Number, required: true, })
	value!: number;
	tweenedValue = 0;
	get formattedValue() {
		return Math.floor(this.tweenedValue).toLocaleString();
	}
	@Watch('value')
	onValueChanged(newValue: number) {
		gsap.to(this, { duration: 0.5, tweenedValue: newValue });
	}
}
</script>

