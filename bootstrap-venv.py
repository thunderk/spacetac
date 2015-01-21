#!/usr/bin/env python
# Copyright (c) 2014, Jonathan Ballet <jon@multani.info>
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# 1. Redistributions of source code must retain the above copyright notice, this
#    list of conditions and the following disclaimer.
# 2. Redistributions in binary form must reproduce the above copyright notice,
#    this list of conditions and the following disclaimer in the documentation
#    and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

"""
Bootstrap a Buildout into its own virtualenv environment.

This script creates a new empty virtualenv, download Buildout's bootstrap script
and execute it in the context of the previously created virtualenv.

    python bootstrap-venv.py

Then, you only have to edit your `buildout.cfg` file and run::

    ./bin/buildout

You can also specify another directory to bootstrap the whole thing in::

    python bootstrap-venv.py some-directory
    cd some-directory
    [ edit buildout.cfg ]
    ./bin/buildout

"""


# This URL is supposed to be stable
BOOTSTRAP_BUILDOUT_URL = "https://bootstrap.pypa.io/bootstrap-buildout.py"

# TODO: find a place where Virtualenv is FOR EVER AND EVER available.
VIRTUALENV_URL = "https://pypi.python.org/packages/source/v/virtualenv/" + \
                 "virtualenv-1.11.6.tar.gz"


import io
import gzip
import os
import subprocess
import sys
import tarfile
try:
    from urllib.request import urlopen
except ImportError:
    from urllib2 import urlopen


def download_virtualenv(destination):
    print("Downloading virtualenv from %s" % VIRTUALENV_URL)
    url = urlopen(VIRTUALENV_URL)

    string_fp = io.BytesIO(url.read())
    gz_fp = gzip.GzipFile(fileobj=string_fp)
    tar_fp = tarfile.TarFile(fileobj=gz_fp)
    tar_fp.extractall(destination)

    path = os.path.join(destination, os.listdir(destination)[0])
    sys.path.insert(0, path)
    import virtualenv
    print("Using virtualenv module at %s" % virtualenv.__file__)
    return virtualenv


def create_virtualenv(destination):
    venv_dir = os.path.join(destination, "parts", "venv")

    try:
        import virtualenv
    except ImportError:
        venv_dist = os.path.join(destination, "parts", "venv-dist")
        virtualenv = download_virtualenv(venv_dist)


    print("Creating virtual environment in %s..." % venv_dir)
    virtualenv.create_environment(venv_dir,
                                  site_packages=False,
                                  clear=True,
                                  unzip_setuptools=False)
    print("Virtual environment created in %s." % venv_dir)
    return venv_dir


def download_bootstrap(destination):
    bootstrap_path = os.path.join(destination, "bootstrap.py")
    print("Downloading Buildout bootstrap from %s..." % BOOTSTRAP_BUILDOUT_URL)
    url = urlopen(BOOTSTRAP_BUILDOUT_URL)

    with open(bootstrap_path, "wb") as fp:
        fp.write(url.read())

    print("Downloaded Buildout bootstrap into %s." % bootstrap_path)
    return bootstrap_path


def make_default_buildout_cfg(buildout_cfg):
    content = [
        "[buildout]",
        "parts = default",
        "",
        "[default]",
        "recipe = zc.recipe.egg",
        "eggs = zc.recipe.egg",
        "interpreter = python",
    ]
    with open(buildout_cfg, "w") as fp:
        fp.writelines(l + "\n" for l in content)


def bootstrap_buildout(venv_dir, bootstrap_path):
    python_bin = os.path.join(venv_dir, "bin", "python")
    assert os.path.exists(python_bin)

    buildout_cfg = os.path.join(os.path.dirname(bootstrap_path), "buildout.cfg")
    try:
        fp = open(buildout_cfg)
    except IOError as err:
        if err.errno != 2:
            raise
        print("Creating a default buildout.cfg file in %s" % buildout_cfg)
        make_default_buildout_cfg(buildout_cfg)
    else:
        fp.close()

    print("Bootstrapping Buildout using: %s %s..." % (
        python_bin, bootstrap_path))
    subprocess.check_call([python_bin, bootstrap_path])

    print("Invoking bootstrapped buildout...")
    buildout_bin = os.path.join(os.path.dirname(bootstrap_path), "bin", "buildout")
    subprocess.check_call([buildout_bin])


if len(sys.argv) == 2:
    real_destination = sys.argv[1]
else:
    real_destination = os.getcwd()


print("About to create Buildout environment in %s..." % real_destination)

os.chdir(real_destination)
destination = "."
venv_dir = create_virtualenv(destination)
bootstrap_path = download_bootstrap(destination)
bootstrap_buildout(venv_dir, bootstrap_path)

