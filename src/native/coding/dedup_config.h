/* Copyright (C) 2016 NooBaa */
#pragma once

#include "../util/common.h"
#include "../util/rabin_fingerprint.h"
#include "dedup.h"

namespace noobaa
{

/*
 *
 * DedupConfig
 *
 * Node.js object that holds dedup configuration
 *
 */
class DedupConfig : public Nan::ObjectWrap
{
public:
    static NAN_MODULE_INIT(setup);

private:
    static Nan::Persistent<v8::Function> _ctor;
    static NAN_METHOD(new_instance);

public:
    typedef uint64_t T;
    typedef GF2<T> GF;
    typedef RabinFingerprint<GF> RabinHasher;
    typedef Dedup<RabinHasher> Deduper;

private:
    explicit DedupConfig(
        int gf_degree,
        T gf_poly,
        int window_len,
        int min_chunk,
        int max_chunk,
        int avg_chunk_bits,
        T avg_chunk_val)
        // init the Galois-Field generated by a primitive polynomial
        // which is used for rabin hashing.
        // the choice of polynom affects performance so usually better to have fewer set bits.
        // the degree is should be up to the size of the type used for computation (uint64_t).
        : gf(gf_degree, gf_poly)
        // rabin hasher uses the window length when removing the bytes that drop out of the window
        , rabin_hasher(gf, window_len)
        // the dedup configuration
        , deduper(
              rabin_hasher,
              window_len,
              min_chunk,
              max_chunk,
              avg_chunk_bits,
              avg_chunk_val)
    {
    }

    virtual ~DedupConfig()
    {
    }

public:
    GF gf;
    RabinHasher rabin_hasher;
    Deduper deduper;
};

} // namespace noobaa