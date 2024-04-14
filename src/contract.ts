import {
  NearBindgen,
  call,
  view,
  LookupSet,
  Vector,
  UnorderedMap
} from 'near-sdk-js';

import { verify } from '../utils/signature';

function getNodeKeysList(): Uint8Array {
  const set = new LookupSet<string>('');
  return set.serialize();
};

function getNodeKeyCount(): number {
  return 0;
};

@NearBindgen({})
class ApplicationContract {
  public_input: string = '';
  verification_key: string = '';
  public_output_list: Vector<string> = new Vector<string>('');

  @call({})
  deployContract(
    public_input: string,
    verification_key: string
  ): void {
    this.public_input = public_input;
    this.verification_key = verification_key;
  };

  @call({})
  settleProof(
    verification_key: string,
    public_output: string,
    signatures: [{
      public_key: string;
      signature: string;
    }]
  ): void {
    const node_count = getNodeKeyCount();
    const node_keys_string = getNodeKeysList();
    const node_keys = LookupSet.reconstruct<string>(new LookupSet<Uint16Array>(node_keys_string.toString()));
    
    if (verification_key != this.verification_key)
      throw Error('Error: Verification key is not valid.');

    if (signatures.length < 0.66 * node_count)
      throw Error('Error: Not enough signatures.');

    for (const { public_key, signature } of signatures) {
      if (!node_keys.contains(public_key))
        throw Error('Error: Signature is not valid.');

      if (!verify(verification_key + public_output, signature, public_key))
        throw Error('Error: Signature is not valid.');
    }

    this.public_output_list.push(public_output);
  };
};