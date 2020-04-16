type Clazz<T> = new (init: Partial<T>) => T;

export class Builder<T> {
  private values: Partial<T> = {};
  private type: Clazz<T>;
  constructor(type: Clazz<T>) {
    this.type = type;
  }
  public with<K extends keyof T>(name: K, value: T[K]): this {
    this.values[name] = value;
    return this;
  }

  public build(): T {
    return new this.type(this.values);
  }
}
