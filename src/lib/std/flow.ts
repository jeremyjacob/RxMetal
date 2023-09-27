import { Observable, map } from 'rxjs';

export const If = (
	cond$: Observable<boolean>,
	ifOpen: ChildNode,
	ifClosed?: ChildNode
) => {
	return cond$.pipe(map((cond) => (cond ? ifOpen : ifClosed)));
};

export const Switch = <T extends string | number | symbol>(
	value$: Observable<T>,
	options: Record<T, ChildNode>
) => {
	return value$.pipe(map((value) => options[value]));
};
