// Star Nest by Pablo RomÃ¡n Andrioli

// This content is under the MIT License.

precision mediump float;

#define iterations 15
#define formuparam 0.53

#define volsteps 12
#define stepsize 0.11

#define zoom   0.800
#define tile   0.850

#define brightness 0.0015
#define darkmatter 0.300
#define distfading 0.770
#define saturation 0.900

uniform vec2 resolution;
uniform vec2 offset;
uniform float scale;

void main()
{
	//get coords and direction
	vec2 uv=gl_FragCoord.xy/resolution.xy-.5;
	uv.y*=resolution.y/resolution.x;
	vec3 dir=vec3(uv*zoom*20./pow(scale,0.5),1.);
	vec3 from=vec3(4.+offset.x*0.05,-2.+offset.y*0.05,-2.5-1.0/scale);
	
	//volumetric rendering
	float s=0.1,fade=1.;
	vec3 v=vec3(0.);
	for (int r=0; r<volsteps; r++) {
		vec3 p=from+s*dir*.5;
		p = abs(vec3(tile)-mod(p,vec3(tile*2.))); // tiling fold
		float pa,a=pa=0.;
		for (int i=0; i<iterations; i++) { 
			p=abs(p)/dot(p,p)-formuparam; // the magic formula
			a+=abs(length(p)-pa); // absolute sum of average change
			pa=length(p);
		}
		float dm=max(0.,darkmatter-a*a*.001); //dark matter
		a*=a*a; // add contrast
		if (r>6) fade*=1.-dm; // dark matter, don't render near
		//v+=vec3(dm,dm*.5,0.);
		v+=fade;
		v+=vec3(s,s*s,s*s*s*s)*a*brightness*fade; // coloring based on distance
		fade*=distfading; // distance fading
		s+=stepsize;
	}
	v=mix(vec3(length(v)),v,saturation); //color adjust
	gl_FragColor = vec4(v*.01,1.);	
}
