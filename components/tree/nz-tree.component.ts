import {
  forwardRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  TemplateRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { isNotNil } from '../core/util/check';
import { InputBoolean } from '../core/util/convert';
import { NzFormatBeforeDropEvent, NzFormatEmitEvent } from '../tree/interface';
import { NzTreeNode } from './nz-tree-node';
import { NzTreeService } from './nz-tree.service';

@Component({
  selector   : 'nz-tree',
  templateUrl: './nz-tree.component.html',
  providers  : [
    NzTreeService,
    {
      provide    : NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NzTreeComponent),
      multi      : true
    }
  ]
})

export class NzTreeComponent implements OnInit, OnChanges, OnDestroy {
  @Input() @InputBoolean() nzShowIcon = false;
  @Input() @InputBoolean() nzShowLine = false;
  @Input() @InputBoolean() nzCheckStrictly = false;
  @Input() @InputBoolean() nzCheckable = false;
  @Input() @InputBoolean() nzShowExpand = true;
  @Input() @InputBoolean() nzAsyncData = false;
  @Input() @InputBoolean() nzDraggable = false;
  @Input() @InputBoolean() nzMultiple = false;
  @Input() @InputBoolean() nzExpandAll: boolean = false;
  @Input() @InputBoolean() nzHideUnMatched = false;
  /**
   * @deprecated use
   * nzExpandAll instead
   */
  @Input() @InputBoolean() nzDefaultExpandAll: boolean = false;
  @Input() nzBeforeDrop: (confirm: NzFormatBeforeDropEvent) => Observable<boolean>;

  @Input()
  // tslint:disable-next-line:no-any
  set nzData(value: any[]) {
    if (Array.isArray(value)) {
      if (!this.nzTreeService.isArrayOfNzTreeNode(value)) {
        // has not been new NzTreeNode
        this.nzNodes = value.map(item => (new NzTreeNode(item)));
      } else {
        this.nzNodes = value;
      }
      this.nzTreeService.conductOption.isCheckStrictly = this.nzCheckStrictly;
      this.nzTreeService.initTree(this.nzNodes);
    } else {
      if (value !== null) {
        console.warn('ngModel only accepts an array and must be not empty');
      }
    }
  }

  /**
   * @deprecated use
   * nzExpandedKeys instead
   */
  @Input()
  set nzDefaultExpandedKeys(value: string[]) {
    this.nzDefaultSubject.next({ type: 'nzExpandedKeys', keys: value });
  }

  /**
   * @deprecated use
   * nzSelectedKeys instead
   */
  @Input()
  set nzDefaultSelectedKeys(value: string[]) {
    this.nzDefaultSubject.next({ type: 'nzSelectedKeys', keys: value });
  }

  /**
   * @deprecated use
   * nzCheckedKeys instead
   */
  @Input()
  set nzDefaultCheckedKeys(value: string[]) {
    this.nzDefaultSubject.next({ type: 'nzCheckedKeys', keys: value });
  }

  @Input()
  set nzExpandedKeys(value: string[]) {
    this.nzDefaultSubject.next({ type: 'nzExpandedKeys', keys: value });
  }

  @Input()
  set nzSelectedKeys(value: string[]) {
    this.nzDefaultSubject.next({ type: 'nzSelectedKeys', keys: value });
  }

  @Input()
  set nzCheckedKeys(value: string[]) {
    this.nzDefaultSubject.next({ type: 'nzCheckedKeys', keys: value });
  }

  @Input()
  set nzSearchValue(value: string) {
    this._searchValue = value;
    this.nzTreeService.searchExpand(value);
    if (isNotNil(value)) {
      this.nzSearchValueChange.emit(this.nzTreeService.formatEvent('search', null, null));
      this.nzOnSearchNode.emit(this.nzTreeService.formatEvent('search', null, null));
    }
  }

  get nzSearchValue(): string {
    return this._searchValue;
  }

  // model bind
  @Output() readonly nzExpandedKeysChange: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() readonly nzSelectedKeysChange: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() readonly nzCheckedKeysChange: EventEmitter<string[]> = new EventEmitter<string[]>();

  @Output() readonly nzSearchValueChange: EventEmitter<NzFormatEmitEvent> = new EventEmitter();
  /**
   * @deprecated use
   * nzSearchValueChange instead
   */
  @Output() readonly nzOnSearchNode: EventEmitter<NzFormatEmitEvent> = new EventEmitter();

  @Output() readonly nzClick: EventEmitter<NzFormatEmitEvent> = new EventEmitter();
  @Output() readonly nzDblClick: EventEmitter<NzFormatEmitEvent> = new EventEmitter();
  @Output() readonly nzContextMenu: EventEmitter<NzFormatEmitEvent> = new EventEmitter();
  @Output() readonly nzCheckBoxChange: EventEmitter<NzFormatEmitEvent> = new EventEmitter();
  @Output() readonly nzExpandChange: EventEmitter<NzFormatEmitEvent> = new EventEmitter();

  @Output() readonly nzOnDragStart: EventEmitter<NzFormatEmitEvent> = new EventEmitter();
  @Output() readonly nzOnDragEnter: EventEmitter<NzFormatEmitEvent> = new EventEmitter();
  @Output() readonly nzOnDragOver: EventEmitter<NzFormatEmitEvent> = new EventEmitter();
  @Output() readonly nzOnDragLeave: EventEmitter<NzFormatEmitEvent> = new EventEmitter();
  @Output() readonly nzOnDrop: EventEmitter<NzFormatEmitEvent> = new EventEmitter();
  @Output() readonly nzOnDragEnd: EventEmitter<NzFormatEmitEvent> = new EventEmitter();
  // tslint:disable-next-line:no-any
  @ContentChild('nzTreeTemplate') nzTreeTemplate: TemplateRef<any>;
  _searchValue = null;
  nzDefaultSubject = new ReplaySubject< { type: string, keys: string[] }>(6);
  nzDefaultSubscription: Subscription;
  nzNodes: NzTreeNode[] = [];
  prefixCls = 'ant-tree';
  nzTreeClass = {};

  onChange: (value: NzTreeNode[]) => void = () => null;
  onTouched: () => void = () => null;

  getTreeNodes(): NzTreeNode[] {
    return this.nzNodes;
  }

  /**
   * public function
   */
  getCheckedNodeList(): NzTreeNode[] {
    return this.nzTreeService.getCheckedNodeList();
  }

  getSelectedNodeList(): NzTreeNode[] {
    return this.nzTreeService.getSelectedNodeList();
  }

  getHalfCheckedNodeList(): NzTreeNode[] {
    return this.nzTreeService.getHalfCheckedNodeList();
  }

  getExpandedNodeList(): NzTreeNode[] {
    return this.nzTreeService.getExpandedNodeList();
  }

  getMatchedNodeList(): NzTreeNode[] {
    return this.nzTreeService.getMatchedNodeList();
  }

  setClassMap(): void {
    this.nzTreeClass = {
      [ this.prefixCls ]               : true,
      [ this.prefixCls + '-show-line' ]: this.nzShowLine,
      [ `${this.prefixCls}-icon-hide` ]: !this.nzShowIcon,
      [ 'draggable-tree' ]             : this.nzDraggable
    };
  }

  writeValue(value: NzTreeNode[]): void {
    if (Array.isArray(value)) {
      this.nzNodes = value;
      this.nzTreeService.conductOption.isCheckStrictly = this.nzCheckStrictly;
      this.nzTreeService.initTree(this.nzNodes);
    } else {
      if (value !== null) {
        console.warn('ngModel only accepts an array and should be not empty');
      }
    }
  }

  registerOnChange(fn: (_: NzTreeNode[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  constructor(public nzTreeService: NzTreeService) {
  }

  ngOnInit(): void {
    this.setClassMap();
    this.nzDefaultSubscription = this.nzDefaultSubject.subscribe((data: { type: string, keys: string[] }) => {
      if (!data || !data.keys) {
        return;
      }
      switch (data.type) {
        case 'nzExpandedKeys':
          this.nzTreeService.calcExpandedKeys(data.keys, this.nzNodes);
          this.nzExpandedKeysChange.emit(data.keys);
          break;
        case 'nzSelectedKeys':
          this.nzTreeService.calcSelectedKeys(data.keys, this.nzNodes, this.nzMultiple);
          this.nzSelectedKeysChange.emit(data.keys);
          break;
        case 'nzCheckedKeys':
          this.nzTreeService.calcCheckedKeys(data.keys, this.nzNodes, this.nzCheckStrictly);
          this.nzCheckedKeysChange.emit(data.keys);
          break;
      }
    });
  }

  ngOnChanges(changes: { [ propertyName: string ]: SimpleChange }): void {
    if (changes.nzCheckStrictly) {
      this.nzTreeService.conductOption.isCheckStrictly = changes.nzCheckStrictly.currentValue;
    }
  }

  ngOnDestroy(): void {
    if (this.nzDefaultSubscription) {
      this.nzDefaultSubscription.unsubscribe();
      this.nzDefaultSubscription = null;
    }
  }
}
