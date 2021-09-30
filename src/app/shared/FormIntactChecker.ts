import { FormGroup } from '@angular/forms';
import { ReplaySubject } from 'rxjs';

/**
 * author Tihomir Magdić
 */
export class FormIntactChecker {

    private _originalValue: any;
    private _lastIntact: boolean;

    constructor(private _form: FormGroup, private _replaySubject?: ReplaySubject<boolean>) {
        this._form.valueChanges.subscribe(() => {
            if(this._form.dirty) {
                this.lastIntact = this._originalValue === JSON.stringify(this._form.value);
            }
        })
    }

    set lastIntact(value: boolean) {
        if (this._lastIntact === value) {
            return;
        }
        this._replaySubject ? this._replaySubject.next(value) : (value ? this._form.markAsPristine() : null);
        this._lastIntact = value;
    }

    get lastIntact(): boolean {
        return this._lastIntact;
    }

    markIntact() {
        this._originalValue = JSON.stringify(this._form.value);
        this.lastIntact = true;
    }
}